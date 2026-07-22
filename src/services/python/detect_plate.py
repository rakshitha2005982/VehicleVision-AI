import sys
import os
import cv2
from ultralytics import YOLO

# Load License Plate Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best.pt")
model = YOLO(MODEL_PATH)

# Check image argument
if len(sys.argv) < 2:
    print("NO_IMAGE")
    sys.exit()

image_path = sys.argv[1]

# Read image
image = cv2.imread(image_path)

if image is None:
    print("IMAGE_NOT_FOUND")
    sys.exit()

# Detect license plates
results = model(image_path)

for result in results:

    if len(result.boxes) == 0:
        print("NOT_FOUND")
        sys.exit()

    best_box = None
    best_score = -1

    for box in result.boxes:

        conf = float(box.conf[0])

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        width = x2 - x1
        height = y2 - y1
        area = width * height

        # Prefer larger confident detections
        score = area * conf

        if score > best_score:
            best_score = score
            best_box = box

    x1, y1, x2, y2 = map(int, best_box.xyxy[0])

    # Add padding
    padding = 25

    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(image.shape[1], x2 + padding)
    y2 = min(image.shape[0], y2 + padding)

    # Crop plate
    plate = image[y1:y2, x1:x2]

    if plate.size == 0:
        print("NOT_FOUND")
        sys.exit()

    # Save cropped plate
    base, ext = os.path.splitext(image_path)
    output_path = base + "_plate" + ext

    cv2.imwrite(output_path, plate)

    # IMPORTANT: Print ONLY the path
    print(output_path)
    sys.exit()

print("NOT_FOUND")