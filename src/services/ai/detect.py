from ultralytics import YOLO
import cv2
import sys
import os

# Load YOLO model
model = YOLO("models/yolov8n.pt")

def detect(image_path):

    image = cv2.imread(image_path)

    results = model(image)

    output_path = os.path.join(
        "output",
        os.path.basename(image_path)
    )

    results[0].save(filename=output_path)

    print(output_path)


if __name__ == "__main__":

    image_path = sys.argv[1]

    detect(image_path)