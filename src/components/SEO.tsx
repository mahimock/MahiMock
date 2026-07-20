import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  path?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "MahiMock | Premium Govt Exam Preparation Platform", 
  description = "India's most trusted platform for UPSC, SSC, Banking, and Railway exams. Get premium mock tests, study materials, and real-time performance analytics at MahiMock.", 
  keywords = "UPSC preparation, SSC CGL mock tests, Banking exams India, Govt job preparation, MahiMock, Online test series, Railway exams, Current Affairs",
  image = "/og-image.png",
  path = ""
}) => {
  const siteUrl = "https://mahimock.com";
  const fullUrl = `${siteUrl}${path}`;
  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="google-site-verification" content="FGRQt9C6SPchswpUtqr9fKVJy83lP4RlLCK15v_12uI" />
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEO;
