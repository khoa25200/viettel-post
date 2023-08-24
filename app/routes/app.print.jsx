import { useEffect, useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import axios from "axios";
import { RedoMajor } from "@shopify/polaris-icons";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useNavigate,
  useSubmit,
  Link,
  Form,
  useSearchParams,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
  Divider,
  List,
  Modal,
  DataTable,
  Loading,
  ButtonGroup,
  TextContainer,
  Spinner,
  LegacyCard,
  Badge,
  Grid,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const orderId = `gid://shopify/Order/${id}`;
  if (id) {
    const { session } = await authenticate.admin(request);

    const { admin } = await authenticate.admin(request);
    const response = await admin.graphql(
      `#graphql
        query {
          order(id: "${orderId}") {
                id
                metafield(key: "custom.viettelPostTrackingId") {
                      id
                      value
                      namespace
                    }
            }
          }
        `
    );
    const responseJson = await response.json();

    return json({
      order: responseJson.data.order,
      id: id,
      shop: session.shop.replace(".myshopify.com", ""),
    });
  } else {
    return "no data print";
  }
};
export async function action({ request }) {
  const body = await request.formData();
  const token = body.get("token");
  const trackingId = body.get("trackingId");
  if (token) {
    const getFutureTimestamp = (minutes) => {
      const currentTime = new Date().getTime();
      const futureTime = currentTime + minutes * 60000;
      return futureTime;
    };
    const responsePrintCode = await axios.post(
      "https://partner.viettelpost.vn/v2/order/printing-code",
      { EXPIRY_TIME: getFutureTimestamp(2), ORDER_ARRAY: [trackingId] },
      {
        headers: {
          accept: "*/*",
          Token: token,
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      }
    );
    return responsePrintCode.data;
  } else {
    return "no token";
  }
}
export default function Index() {
  const [searchParams] = useSearchParams();
  const id = searchParams.getAll("id");
  const printData = useLoaderData();
  const checkViettelPost = printData?.order?.metafield;
  console.log("order====>", printData);
  const actionData = useActionData();
  const [linkPrintV, setLinkPrintV] = useState({
    status: "",
    a5: "",
    a6: "",
    a7: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("actionDataa====>", actionData);
    if (actionData) {
      if (actionData?.error) {
        if (actionData.message === "Token invalid") {
          navigate("/app/login");
        }
      } else {
        setIsLoading(false);
        setLinkPrintV({
          status: "OK",
          a5: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=1&bill=${actionData?.message}&showPostage=1`,
          a6: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=2&bill=${actionData?.message}&showPostage=1`,
          a7: `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=100&bill=${actionData?.message}&showPostage=1`,
        });
      }
    }
  }, [actionData]);

  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [tracking] = useState(printData?.order?.metafield?.value);
  const getLinkPrint = () => {
    setIsLoading(true);
    setToken(localStorage.getItem("token") || "");
  };

  return (
    <Page
      backAction={{ content: "Products", url: "/app" }}
      title={`#${id}`}
      titleMetadata={<Badge status="attention">In Viettel Post</Badge>}
      secondaryActions={
        <Button
          icon={RedoMajor}
          target="_blank"
          url={`https://admin.shopify.com/store/${printData?.shop}/orders/${id}`}
        >
          Back to order
        </Button>
      }
    >
      <Divider />
      <br />
      {checkViettelPost ? (
        <>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <ButtonGroup>
                <Button url={linkPrintV?.a5} target="_blank">
                  A5
                </Button>
                <Button url={linkPrintV?.a6} target="_blank">
                  A6
                </Button>
                <Button url={linkPrintV?.a7} target="_blank">
                  A7
                </Button>
              </ButtonGroup>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <div style={{ textAlign: "right" }}>
                <Form method="post">
                  <input name="token" type="hidden" value={token} />
                  <input name="trackingId" type="hidden" value={tracking} />
                  <Button loading={isLoading} submit onClick={getLinkPrint}>
                    🖨️ Get link print
                  </Button>
                </Form>
              </div>
            </Grid.Cell>
          </Grid>

          <br />
          {linkPrintV?.status === "OK" ? (
            <>
              <LegacyCard sectioned>
                <div
                  style={{
                    width: "100%",
                    height: "600px",
                    border: "none",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <iframe
                    id="receipt"
                    src={linkPrintV?.a6}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      margin: 0,
                      padding: 0,
                      zIndex: 999999,
                    }}
                  ></iframe>
                </div>
              </LegacyCard>
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <>
          <Button url={`/app/viettel/${id}`}>Create Order</Button>
        </>
      )}
    </Page>
  );
}
