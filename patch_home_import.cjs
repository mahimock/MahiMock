const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

code = code.replace("import { Link } from 'react-router-dom';", "import { Link, useNavigate } from 'react-router-dom';");

fs.writeFileSync('src/pages/Home.tsx', code);
