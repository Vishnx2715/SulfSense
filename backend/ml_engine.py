import math
from pathlib import Path
from typing import Dict, Any, Tuple

import numpy as np
import onnxruntime as ort


BASELINE_R = 238
BASELINE_G = 228
BASELINE_B = 195

FEATURE_NAMES = [
    "R",
    "G",
    "B",
    "clear",
    "temperature",
    "humidity",
]


def rgb_to_xyz(r: float, g: float, b: float) -> Tuple[float, float, float]:
    r_lin = r / 255.0
    g_lin = g / 255.0
    b_lin = b / 255.0

    r_lin = ((r_lin + 0.055) / 1.055) ** 2.4 if r_lin > 0.04045 else r_lin / 12.92
    g_lin = ((g_lin + 0.055) / 1.055) ** 2.4 if g_lin > 0.04045 else g_lin / 12.92
    b_lin = ((b_lin + 0.055) / 1.055) ** 2.4 if b_lin > 0.04045 else b_lin / 12.92

    r_lin *= 100
    g_lin *= 100
    b_lin *= 100

    x = r_lin * 0.4124 + g_lin * 0.3576 + b_lin * 0.1805
    y = r_lin * 0.2126 + g_lin * 0.7152 + b_lin * 0.0722
    z = r_lin * 0.0193 + g_lin * 0.1192 + b_lin * 0.9505
    return x, y, z


def xyz_to_lab(x: float, y: float, z: float) -> Tuple[float, float, float]:
    ref_x, ref_y, ref_z = 95.047, 100.000, 108.883
    x_n, y_n, z_n = x / ref_x, y / ref_y, z / ref_z

    def f(t: float) -> float:
        return t ** (1.0 / 3.0) if t > 0.008856 else (7.787 * t) + (16.0 / 116.0)

    fx, fy, fz = f(x_n), f(y_n), f(z_n)

    l = max(0.0, min(100.0, (116.0 * fy) - 16.0))
    a = (fx - fy) * 500.0
    b = (fy - fz) * 200.0

    return l, a, b


def calculate_delta_e(r: int, g: int, b: int) -> float:
    base_xyz = rgb_to_xyz(BASELINE_R, BASELINE_G, BASELINE_B)
    base_lab = xyz_to_lab(*base_xyz)

    curr_xyz = rgb_to_xyz(r, g, b)
    curr_lab = xyz_to_lab(*curr_xyz)

    dl = curr_lab[0] - base_lab[0]
    da = curr_lab[1] - base_lab[1]
    db = curr_lab[2] - base_lab[2]

    return float(math.sqrt(dl * dl + da * da + db * db))


class SulfSenseMLEngine:
    def __init__(self):
        model_path = Path(__file__).resolve().parent / "h2s_model.onnx"

        if not model_path.exists():
            raise FileNotFoundError(
                f"ONNX model not found: {model_path}"
            )

        self.session = ort.InferenceSession(
            str(model_path),
            providers=["CPUExecutionProvider"],
        )

        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name

    def estimate_dose(
        self,
        r: int,
        g: int,
        b: int,
        clear: int,
        temp: float = 25.0,
        rh: float = 50.0,
    ) -> Dict[str, Any]:

        # Basic sensor quality check.
        if r >= 254 and g >= 254 and b >= 254:
            return {
                "estimated_dose": 0.0,
                "uncertainty": 0.0,
                "reading_quality": "INVALID",
                "risk_state": "DATA_INVALID",
                "delta_e": 0.0,
                "temp_factor": 1.0,
            }

        features = np.array(
            [[r, g, b, clear, temp, rh]],
            dtype=np.float32,
        )

        prediction = self.session.run(
            [self.output_name],
            {self.input_name: features},
        )[0]

        raw_prediction = float(np.asarray(prediction).reshape(-1)[0])

        # Dose cannot be negative in the app output.
        estimated_dose = round(max(0.0, raw_prediction), 1)

        delta_e = calculate_delta_e(r, g, b)

        # Keep the existing API field.
        # This ONNX model does not provide a validated uncertainty estimate.
        uncertainty = 0.0

        # Keep the existing app risk-state logic.
        if estimated_dose >= 200.0:
            risk_state = "HAZARDOUS"
        elif estimated_dose >= 100.0:
            risk_state = "WARNING"
        elif estimated_dose >= 40.0:
            risk_state = "CAUTION"
        else:
            risk_state = "NORMAL"

        return {
            "estimated_dose": estimated_dose,
            "uncertainty": uncertainty,
            "reading_quality": "EXCELLENT" if clear >= 150 else "FAIR",
            "risk_state": risk_state,
            "delta_e": round(delta_e, 2),
            "temp_factor": 1.0,
        }


ml_engine = SulfSenseMLEngine()
