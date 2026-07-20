import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf8');

// I will just add a textarea for features where they are separated by commas or newlines
content = content.replace(/<\/div>\n          \n          <div>\n            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social & Contact Links<\/h3>/, `            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Features (one per line)</label>
            <textarea 
              value={formData.aboutContent.features.join('\\n')}
              onChange={(e) => setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, features: e.target.value.split('\\n').filter(Boolean) } }))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium min-h-[120px] resize-y"
              placeholder="Enter features, one per line..."
            />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social & Contact Links</h3>`);

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', content);
