from PIL import Image

img = Image.open('CODE-TV -1.png').convert('RGB')
w, h = img.size

# Look at debug_tv_chest.png
# Box top is at ~49.0%, box bottom is at ~72.5%
# Box left is at ~29.5%, box right is at ~70.5%
# Dragon medallion is at bottom center of the box: X ~ 49.5%, Y ~ 69.5%
# The upper empty interior of the box for the 6 boxes:
# Y from 52.0% to 65.0% (Center Y: ~58.5%)
# Width: ~32.0% (Center X: 49.5%)

print("Box interior candidate:")
print(f"Top: 59.0%, Left: 49.5%, Width: 32.0%, Height: 8.5%")
print(f"Plaque: Top: 79.5%, Left: 49.5%, Width: 32.0%, Height: 7.5%")
