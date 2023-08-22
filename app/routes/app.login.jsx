import {
  Page,
  FormLayout,
  Box,
  TextField,
  Button,
  Card,
  ButtonGroup,
  Text,
  Spinner,
} from "@shopify/polaris";
import { useEffect, useState, useCallback } from "react";

import axios from "axios";
import {
  Form,
  useActionData,
  useSubmit,
  useNavigate,
  Link,
} from "@remix-run/react";

export async function action({ request }) {
  const body = await request.formData();
  const rawData = {
    USERNAME: body.get("email"),
    PASSWORD: body.get("password"),
  };

  const loginResponse = await axios.post(
    "https://partner.viettelpost.vn/v2/user/Login",
    rawData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    }
  );
  return loginResponse.data;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const [failMes, setFailMes] = useState("");

  const loginResponse = useActionData();

  useEffect(() => {
    console.log("loginpage=>", loginResponse);
    if (loginResponse?.error) {
      setFailMes(loginResponse?.message);
      setIsLoadingLogin(false);
    } else {
      localStorage.setItem("token", loginResponse?.data?.token);
      localStorage.setItem("phoneNumber", loginResponse?.data?.phone);
      setFailMes("");
      const localToken = localStorage.getItem("token") || "";
      const localPhoneNumber = localStorage.getItem("phoneNumber") || "";
      if (
        localToken === loginResponse?.data?.token &&
        localPhoneNumber === loginResponse?.data?.phone
      ) {
        // alert("Đăng nhập thành công !!!!");
        setIsLoadingLogin(false);
        setFailMes("Đăng nhập thành công!!! Đang điều hướng...")
        navigate("/app");
      }
      // navigate("/app");
    }
  }, [loginResponse]);

  return (
    <>
      <Page>
        <Card>
          <FormLayout>
            <Text variant="heading3xl" as="h2">
              Đăng nhập:
            </Text>
            <Form method="post">
              <TextField
                label="Email/Số Điện Thoại:"
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
              {failMes ? (
                <>
                  {" "}
                  <Button plain destructive>
                    {failMes}
                  </Button>
                  <br />
                  <br />
                </>
              ) : (
                <></>
              )}

              <ButtonGroup>
                <Button
                  loading={isLoadingLogin}
                  submit
                  textAlign="center"
                  destructive
                  onClick={() => {
                    setIsLoadingLogin(true);
                  }}
                >
                  Đăng Nhập
                </Button>

                <Button
                  plain
                  url="https://id.viettelpost.vn/Account/Register"
                  target="_blank"
                >
                  Đăng Ký
                </Button>
                <Button
                  plain
                  url="https://id.viettelpost.vn/Account/ForgotPassword"
                  target="_blank"
                >
                  Quên mật khẩu?
                </Button>
              </ButtonGroup>
            </Form>
          </FormLayout>
        </Card>
      </Page>
    </>
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
