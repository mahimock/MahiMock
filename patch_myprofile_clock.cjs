const fs = require('fs');
let code = fs.readFileSync('src/pages/MyProfile.tsx', 'utf8');

code = code.replace(
  "import { Camera, Loader2, User as UserIcon, Mail, Phone, Calendar, MapPin, Target, Trophy, Activity, Award, Settings, LogOut, ChevronRight, Moon, Bell, Globe, Shield, HelpCircle, Heart, Lock, FileQuestion, Trash2 } from 'lucide-react';",
  "import { Camera, Loader2, User as UserIcon, Mail, Phone, Calendar, MapPin, Target, Trophy, Activity, Award, Settings, LogOut, ChevronRight, Moon, Bell, Globe, Shield, HelpCircle, Heart, Lock, FileQuestion, Trash2, Clock } from 'lucide-react';"
);

fs.writeFileSync('src/pages/MyProfile.tsx', code);
