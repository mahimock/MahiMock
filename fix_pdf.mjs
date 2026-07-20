import fs from 'fs';

let content = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');
content = content.replace("import html2canvas from 'html2canvas';", "import * as htmlToImage from 'html-to-image';");
content = content.replace("const canvas = await html2canvas(element, { scale: 2 });", "const dataUrl = await htmlToImage.toPng(element, { pixelRatio: 2 });");
content = content.replace("const imgData = canvas.toDataURL('image/png');", "const imgData = dataUrl;");
content = content.replace("const pdfHeight = (canvas.height * pdfWidth) / canvas.width;", "const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;");
fs.writeFileSync('src/pages/TestResult.tsx', content);

let cert = fs.readFileSync('src/pages/CertificateView.tsx', 'utf8');
cert = cert.replace("import html2canvas from 'html2canvas';", "import * as htmlToImage from 'html-to-image';");
cert = cert.replace("const canvas = await html2canvas(certificateRef.current, {\n        scale: 2,\n        useCORS: true,\n        logging: false,\n        backgroundColor: '#ffffff'\n      });", "const dataUrl = await htmlToImage.toPng(certificateRef.current, {\n        pixelRatio: 2,\n        backgroundColor: '#ffffff'\n      });");
cert = cert.replace("const imgData = canvas.toDataURL('image/png');", "const imgData = dataUrl;");
cert = cert.replace("const pdfHeight = (canvas.height * pdfWidth) / canvas.width;", "const pdfHeight = (certificateRef.current.offsetHeight * pdfWidth) / certificateRef.current.offsetWidth;");
fs.writeFileSync('src/pages/CertificateView.tsx', cert);

