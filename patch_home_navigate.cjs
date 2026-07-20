const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

code = code.replace("window.location.href = `/test-instructions/${test.id}`", "navigate(`/test-instructions/${test.id}`)");

// Ensure useNavigate is imported and used
if (!code.includes("const navigate = useNavigate();")) {
  code = code.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const navigate = useNavigate();");
  if (!code.includes("useNavigate")) {
    code = code.replace("import { Link }", "import { Link, useNavigate }");
  }
}

fs.writeFileSync('src/pages/Home.tsx', code);
