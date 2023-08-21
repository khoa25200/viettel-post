import React, { useState, useCallback, useEffect } from "react";
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  TopBar,
  ActionList,
  Icon,
  Frame,
  Text,
} from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix";
import { ArrowLeftMinor, QuestionMarkMajor } from "@shopify/polaris-icons";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  await authenticate.admin(request);

  return json({
    polarisTranslations: require("@shopify/polaris/locales/en.json"),
    apiKey: process.env.SHOPIFY_API_KEY,
  });
}

export default function App() {
  const { apiKey, polarisTranslations } = useLoaderData();
  //nav
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("Đăng nhập");
  const toggleIsUserMenuOpen = useCallback(() => {
    setPhone("chaneg");
    navigate("/app/login");
    setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen);
  }, []);

  const toggleIsSecondaryMenuOpen = useCallback(
    () => setIsSecondaryMenuOpen((isSecondaryMenuOpen) => !isSecondaryMenuOpen),
    []
  );

  const handleNavigationToggle = useCallback(() => {
    console.log("toggle navigation visibility");
  }, []);

  const logo = {
    width: 60,
    topBarSource:
      "http://nvs.navitech.co/wp-content/uploads/2023/08/LOGO_Navitech_Type-1.png",
    url: "/app/",
    accessibilityLabel: "Jaded Pixel",
  };
  useEffect(() => {
    const item = localStorage.getItem("phoneNumber") || "";
    if (item && item !== "undefined") {
      setPhone("Đăng Xuất " + item);
    } else {
      setPhone("Đăng nhập");
    }
  }, [phone]);
  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [{ content: "Đăng xuất", icon: ArrowLeftMinor }],
        },
        {
          items: [
            { content: "Đăng Nhập Tài Khoản Khác", icon: ArrowLeftMinor },
          ],
        },
      ]}
      name="Viettel Post"
      detail={phone}
      initials="D"
      open={false}
      onToggle={toggleIsUserMenuOpen}
    />
  );

  const secondaryMenuMarkup = (
    <TopBar.Menu
      activatorContent={
        <span>
          <Icon source={QuestionMarkMajor} />
          <Text as="span" visuallyHidden>
            Secondary menu
          </Text>
        </span>
      }
      open={isSecondaryMenuOpen}
      onOpen={toggleIsSecondaryMenuOpen}
      onClose={toggleIsSecondaryMenuOpen}
      actions={[
        {
          items: [{ content: "Community forums" }],
        },
      ]}
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      secondaryMenu={secondaryMenuMarkup}
      // searchResultsVisible={isSearchActive}
      // searchField={searchFieldMarkup}
      // searchResults={searchResultsMarkup}
      // onSearchResultsDismiss={handleSearchResultsDismiss}
      onNavigationToggle={handleNavigationToggle}
    />
  );
  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        data-api-key={apiKey}
      />
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/login">Login</Link>
      </ui-nav-menu>
      <PolarisAppProvider
        i18n={polarisTranslations}
        linkComponent={RemixPolarisLink}
      >
        <div style={{ height: "80px" }}>
          <Frame topBar={topBarMarkup} logo={logo} />
        </div>
        <Outlet />
      </PolarisAppProvider>
    </>
  );
}

/** @type {any} */
const RemixPolarisLink = React.forwardRef((/** @type {any} */ props, ref) => (
  <Link {...props} to={props.url ?? props.to} ref={ref}>
    {props.children}
  </Link>
));

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
