from PIL import Image

img = Image.open('CODE-RADIO-1.png').convert('RGB')
w, h = img.size

# Let's inspect the layout of CODE-RADIO-1.png
# Save several slices to inspect
box_slice = img.crop((int(w * 0.28), int(h * 0.50), int(w * 0.72), int(h * 0.68)))
box_slice.save('debug_radio_box_slice.png')

plaque_slice = img.crop((int(w * 0.30), int(h * 0.75), int(w * 0.70), int(h * 0.86)))
plaque_slice.save('debug_radio_plaque_slice.png')

print("Saved debug slices for radio")
