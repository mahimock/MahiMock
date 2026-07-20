import re

with open("src/layouts/MainLayout.tsx", "r") as f:
    content = f.read()

# Add import
import_stmt = "import AboutMahiMockFooter from '../components/AboutMahiMockFooter';\n"
if "AboutMahiMockFooter" not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\n" + import_stmt)

# Inject the component before {/* Footer */}
# The footer is currently:
#       {/* Footer */}
#       <footer className="hidden lg:block bg-[#111827] text-white pt-16 pb-8 mt-auto rounded-t-[2.5rem] lg:mx-4 mb-4">
target = "{/* Footer */}"
injection = "<AboutMahiMockFooter />\n\n      {/* Footer */}"
if "<AboutMahiMockFooter />" not in content:
    content = content.replace(target, injection)

with open("src/layouts/MainLayout.tsx", "w") as f:
    f.write(content)
