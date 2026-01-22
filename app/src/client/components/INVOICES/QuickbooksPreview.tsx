import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./QuickbooksPreview.css";
import ImportProductsArt from "../componenetsss/import products.svg";
import BackArrowButton from "../componenetsss/BackArrowButton";
import IntegrationCard from "../componenetsss/IntegrationCard";
import QuickSync from "./QuickSync";

type QuickbooksPreviewProps = {
  onBack?: () => void;
  onSelectRazorpay?: () => void;
  onSelectGoogle?: () => void;
};

const QuickbooksLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M31.8965 3.84676C36.0339 7.09801 38.6569 11.3219 39.8861 16.4047C40.4487 22.971 38.9586 28.5986 34.7054 33.7029C30.5516 38.0945 25.5408 39.806 19.5971 40C14.4137 39.9456 10.0474 37.9331 6.20819 34.5248C3.7721 32.0381 2.33783 29.3361 1.09446 26.1159C0.931018 25.7067 0.931018 25.7067 0.76428 25.2893C-0.785068 20.4927 0.165688 15.1488 2.31946 10.7398C5.02779 5.94491 9.19502 2.55951 14.3908 0.699767C20.4685 -0.927481 26.7478 0.348847 31.8965 3.84676Z" fill="#2FA11F"/>
  <path d="M21.103 7.09863C22.1137 7.29893 22.1137 7.29893 23.1447 7.50327C23.9735 8.73518 24.0629 8.96107 24.0541 10.3408C24.054 10.6647 24.054 10.9887 24.0539 11.3224C24.0497 11.6702 24.0455 12.018 24.0411 12.3763C24.04 12.7338 24.0388 13.0914 24.0376 13.4597C24.033 14.6018 24.0228 15.7437 24.0124 16.8858C24.0083 17.66 24.0046 18.4342 24.0012 19.2085C23.9922 21.1066 23.9781 23.0046 23.9614 24.9026C24.6124 24.8542 25.2632 24.8011 25.9137 24.7461C26.2761 24.7171 26.6385 24.688 27.0119 24.6581C28.7962 24.3814 29.9994 23.5487 31.0562 22.1207C31.5956 20.3033 31.5089 19.1967 30.5968 17.518C29.1136 15.7216 27.8776 15.4998 25.5947 15.1913C25.5947 14.2566 25.5947 13.3219 25.5947 12.3589C28.0246 12.1582 29.7047 12.587 31.7197 13.9774C33.621 15.7718 34.622 17.27 34.7312 19.9205C34.7078 22.1819 33.9934 23.5984 32.5364 25.3072C29.0466 28.5925 26.2706 27.735 21.103 27.735C21.103 20.925 21.103 14.115 21.103 7.09863Z" fill="#F7FBF6"/>
  <path d="M19.0612 12.3579C19.0612 19.168 19.0612 25.978 19.0612 32.9944C18.3875 32.8608 17.7137 32.7273 17.0196 32.5897C16.1908 31.3578 16.1014 31.1319 16.1102 29.7522C16.1103 29.4283 16.1103 29.1043 16.1104 28.7706C16.1146 28.4228 16.1188 28.075 16.1231 27.7167C16.1243 27.3592 16.1255 27.0016 16.1267 26.6333C16.1312 25.4912 16.1415 24.3493 16.1519 23.2072C16.156 22.433 16.1597 21.6588 16.163 20.8845C16.172 18.9864 16.1861 17.0884 16.2029 15.1904C15.4848 15.2319 14.7671 15.2801 14.0496 15.3311C13.6499 15.3572 13.2502 15.3833 12.8383 15.4102C11.1217 15.6917 10.4292 16.3695 9.26123 17.6182C8.6356 18.8581 8.75923 19.8909 8.8529 21.2599C9.53071 22.7376 10.2742 23.7059 11.7112 24.497C13.2028 24.7903 13.2028 24.7903 14.5696 24.9017C14.5696 25.8364 14.5696 26.7711 14.5696 27.7341C12.046 27.9096 10.452 27.6924 8.44457 26.1156C6.5378 24.291 5.57157 22.5101 5.43311 19.8943C5.49882 17.5844 6.29357 16.1143 7.92139 14.4902C11.5395 11.2923 13.0378 12.3579 19.0612 12.3579Z" fill="#F7FBF7"/>
  </svg>
);

const QuickbooksPreview: React.FC<QuickbooksPreviewProps> = ({
  onBack,
  onSelectRazorpay,
  onSelectGoogle,
}) => {
  const navigate = useNavigate();

  const handleConnect = useCallback(() => {
    navigate('/get-started/integrations/quickbooks');
  }, [navigate]);

  return (
    <div className="ip-page">
      {/* TOPBAR */}
      <div className="ip-topbar">
        <BackArrowButton onClick={onBack} />
        <div className="ip-topbar-title">Import Products</div>
      </div>

      {/* BODY */}
      <div className="ip-body">
        {/* LEFT */}
        <div className="ip-left">
          <div className="ip-section-title">
            Automate Invoice Generation from Integrations
          </div>

          <div className="ip-gateway-grid">
            {/* QuickBooks Integration */}
            <IntegrationCard
              name="QuickBooks"
              description="Import products from QuickBooks to manage your billing and invoicing"
              logo={<QuickbooksLogo />}
              logoAlt="QuickBooks"
              actionLabel="Connect"
              onAction={handleConnect}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="ip-right">
          <QuickSync />
        </div>
      </div>
    </div>
  );
};

export default QuickbooksPreview;
