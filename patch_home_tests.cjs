const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
code = code.replace("collection(db, 'mockTests')", "collection(db, 'tests')");
code = code.replace("query(collection(db, 'tests'), limit(3))", "query(collection(db, 'tests'), where('status', '==', 'Published'), limit(3))");
// Note: 'where' needs to be imported if it's not
if (!code.includes("where,")) {
  code = code.replace("collection, query,", "collection, query, where,");
}
fs.writeFileSync('src/pages/Home.tsx', code);
