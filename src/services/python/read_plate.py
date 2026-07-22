import sys
import re
import easyocr

if len(sys.argv) < 2:
    print("NO_IMAGE")
    sys.exit()

image_path = sys.argv[1]

reader = easyocr.Reader(['en'], gpu=False)

results = reader.readtext(image_path)

text = ""

for item in results:
    text += item[1] + " "

text = text.upper().replace(" ", "")

print("OCR TEXT:")
print(text)

# Find possible vehicle number candidates
candidates = re.findall(r"[A-Z0-9]{8,12}", text)

vehicle_number = "NOT_DETECTED"

for candidate in candidates:

    # OCR corrections only on candidate
    corrected = (
        candidate
        .replace("O", "0")
        .replace("Z", "2")
    )

    # First two characters should be letters
    corrected = corrected[:2] + corrected[2:].replace("I", "1")

    if re.fullmatch(r"[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}", corrected):
        vehicle_number = corrected
        break

print("\nVehicle Number:")
print(vehicle_number)