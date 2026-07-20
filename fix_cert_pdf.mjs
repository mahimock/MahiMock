import fs from 'fs';

let cert = fs.readFileSync('src/pages/CertificateView.tsx', 'utf8');

const targetStr = `      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = dataUrl;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);`;

const newStr = `      const dataUrl = await htmlToImage.toPng(certificateRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const imgData = dataUrl;
      const width = certificateRef.current.offsetWidth * 3;
      const height = certificateRef.current.offsetHeight * 3;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);`;

cert = cert.replace(targetStr, newStr);
fs.writeFileSync('src/pages/CertificateView.tsx', cert);
