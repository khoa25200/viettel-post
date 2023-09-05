import {
  Box,
  Card,
  Layout,
  List,
  Page,
  Text,
  FormLayout,
  TextField,
  Button,
  DatePicker,
  Select,
  RadioButton,
  Divider,
  Icon,
  Checkbox,
  Banner,
} from "@shopify/polaris";
import { CircleChevronLeftMinor, SoftPackMajor } from "@shopify/polaris-icons";
import {
  useParams,
  Link,
  useLoaderData,
  useActionData,
  useSubmit,
  Form,
  useNavigate,
  useFetcher,
} from "@remix-run/react";
import { apiVersion, authenticate } from "../shopify.server";
import { json, redirect } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

export const loader = async ({ request, params }) => {
  return json({
    firstDisList: "",
  });
};

export async function action({ request, params }) {
  const body = await request.formData();
  const token = body.get("token") || "no token";
}

export default function SetUpCustomer() {
  const params = useParams();

  const customerId = params.customerId || "";
  return (
    <Page>
      <Layout>Customer ID: {customerId}</Layout>
      developing...
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
