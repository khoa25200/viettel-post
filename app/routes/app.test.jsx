import {
  Page,
  FormLayout,
  Box,
  TextField,
  Button,
  Card,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import axios from "axios";
import { Form, useActionData, useSubmit, useNavigate } from "@remix-run/react";
import { apiVersion, authenticate } from "../shopify.server";
import { json, redirect } from "@remix-run/node";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const orderId = "gid://shopify/Order/4957128425660";
  const orderNote = "test note";
  const resOrder = await admin.graphql(
    `#graphql
        query GetOrder($orderId: ID!) {
  order(id: $orderId) {
    metafield(key: "custom.viettelPostTrackingId") {
      id
      value
      namespace
      key
      type
    }
    }
}`,
    {
      variables: {
        orderId,
        orderNote,
      },
    }
  );
  
  // const metafieldNumber = json(
  //   resOrderJson?.data?.order?.metafield?.id
  //     ? resOrderJson?.data?.order?.metafield?.id?.split("/")[4]
  //     : "nodata"
 
  var sth = "";
  try {
    createMetafield(4957128425660, "newcreateteteuuuauaadhqswudhosidasodjaso");
    sth = "tạo thành cônggggg";
  } catch (err) {
    sth = "tạo thất bại";
  }

  return sth;
  async function updateMetafield(orderId, metafieldId, newValue) {
    await admin.rest.put({
      path: `/orders/${orderId}/metafields/${metafieldId}.json`,
      data: {
        metafield: {
          id: metafieldId,
          value: newValue,
        },
      },
    });
  }
  async function createMetafield(orderId, newValue) {
    await admin.rest.post({
      path: `/orders/${orderId}/metafields.json`,
      data: {
        metafield: {
          namespace: "custom",
          key: "viettelPostTrackingId",
          type: "single_line_text_field",
          value: newValue,
        },
      },
    });
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  useEffect(() => {
    if (token) {
      alert("Login Success!!!");

      navigate("/app");
    }
  }, [token]);

  const loginResponse = useActionData();
  useEffect(() => {
    console.log("xem xem", loginResponse);
  }, [loginResponse]);
  const submit = useSubmit();
  const handleLogin = async () => {
    try {
      // submit({}, { replace: true, method: "POST" });
      console.log(loginResponse);
      if (loginResponse?.error) {
        console.log(loginResponse?.message);
      } else {
        console.log("Token=>", loginResponse?.data?.token);
        setToken(loginResponse?.data?.token);
        localStorage.setItem("token", loginResponse?.data?.token);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <Page>
      <ui-title-bar title="Login" />
      <Card>
        <FormLayout>
          <Form method="post" onSubmit={handleLogin}>
            <button>Test Sth</button>
            <TextField
              label="Email:"
              name="email"
              placeholder="Email or Phone Number"
              value={email}
              type={"text" || "number"}
              onChange={(value) => {
                setEmail(value);
              }}
              autoComplete="off"
            />
            <TextField
              label="Password:"
              name="password"
              placeholder="Password"
              value={password}
              type="password"
              onChange={(value) => {
                setPassword(value);
              }}
              autoComplete="off"
            />
            <br />
            <Button submit textAlign="center" destructive>
              Login
            </Button>
          </Form>
        </FormLayout>
      </Card>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="1"
      paddingInlineEnd="1"
      background="bg-subdued"
      borderWidth="1"
      borderColor="border"
      borderRadius="1"
    >
      <code>{children}</code>
    </Box>
  );
}
