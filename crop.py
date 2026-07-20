from PIL import Image
try:
    img = Image.open('public/icon-512x512.png')
    # The logo mark is in the top half. Let's find the non-transparent bounding box.
    bbox = img.getbbox()
    if bbox:
        img_cropped = img.crop(bbox)
        # Now let's just take the top half of the cropped image
        w, h = img_cropped.size
        # The M and cap is the top part. Let's crop the top 55%
        m_mark = img_cropped.crop((0, 0, w, int(h * 0.55)))
        # Further crop to bounding box of the M mark
        m_bbox = m_mark.getbbox()
        if m_bbox:
            final_m = m_mark.crop(m_bbox)
            final_m.save('public/logo-m.png')
            print("Successfully cropped and saved as public/logo-m.png")
        else:
            print("Could not find M mark bounding box")
except Exception as e:
    print(f"Error: {e}")
