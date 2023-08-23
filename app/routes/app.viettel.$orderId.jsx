import {
  Box,
  Card,
  Layout,
  List,
  Page,
  Text,
  VerticalStack,
  FormLayout,
  TextField,
  Button,
  DatePicker,
  Select,
  RadioButton,
  Divider,
} from "@shopify/polaris";
import {
  useParams,
  Link,
  useLoaderData,
  useActionData,
  useSubmit,
  Form,
  useNavigate,
} from "@remix-run/react";
import { apiVersion, authenticate } from "../shopify.server";

import { json, redirect } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const { admin } = await authenticate.admin(request);

  const orderId = `gid://shopify/Order/${params.orderId}`;
  const response = await admin.graphql(
    `#graphql
      query{
        order(id: "${orderId}") {
          note
          createdAt
          subtotalLineItemsQuantity
          totalPrice
          currentSubtotalLineItemsQuantity
          id
          name
          phone
          email
          customer {
            id
            displayName
            firstName
            lastName
            phone
            email
             addresses {
                address1
                address2
                firstName
                lastName
                phone
            }
            defaultAddress{
                address1
                address2
                firstName
                lastName
                phone
            }
          }
        }
      }`
  );

  const responseJson = await response.json();

  const provinceRes = await axios.get(
    "https://partner.viettelpost.vn/v2/categories/listProvince",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    }
  );
  // const listInventoryRes = await axios.get(
  //   "https://partner.viettelpost.vn/v2/user/listInventory",
  //   {
  //     headers: {
  //       token:
  //         "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIwOTE4NDE0ODQ4IiwiVXNlcklkIjo2NzMyMTMyLCJGcm9tU291cmNlIjo1LCJUb2tlbiI6IkVRUkVRSVpNWkhLVFVYTDgiLCJleHAiOjE2OTI3NTMxOTAsIlBhcnRuZXIiOjY3MzIxMzJ9.5PvNqhS1Kq-7IcP8hlS2k9d_8ci4M76ADzn99hF_pe2fUph6SWGne611dKhttTtX5h3phob_FI-QXaUwaiDCYA",
  //       // "Accept": "application/json, text/plain, */*",
  //       accept: "*/*",
  //       Authorization: `Bearer ${process.env.API_TOKEN}`,
  //     },
  //   }
  // );
  return json({
    order: responseJson?.data?.order,
    shop: session?.shop?.replace(".myshopify.com", ""),
    provinceResponse: provinceRes?.data,
    // listIventory: listInventoryRes?.data,
  });
};

export async function action({ request, params }) {
  const body = await request.formData();
  const token = body.get("token");
  if (token) {
    // get from form data
    const _action = body.get("_action");
    let inventory = body.get("inventory");
    if (inventory !== "Nhập thủ công") {
      inventory = JSON.parse(inventory);
    }
    const senderName = body.get("senderName");

    const senderPhone = body.get("senderPhone");
    const senderEmail = body.get("senderEmail");
    const senderDistrict = body.get("senderDistrict");
    const senderProvince = body.get("senderProvince");
    const senderWard = body.get("senderWard");
    const senderFullAdress = body.get("senderFullAdress");

    const receiveName = body.get("receiveName");
    const receivePhone = body.get("receivePhone");
    const receiveEmail = body.get("receiveEmail");
    const receiveDistrict = body.get("receiveDistrict");
    const receiveWard = body.get("receiveWard");
    const receiveProvince = body.get("receiveProvince");
    const receiveFullAddress = body.get("receiveFullAddress");

    const valueProductType = body.get("radioTypes") === "buukien" ? "HH" : "TH";
    const productLength = body.get("productLength");
    const productWidth = body.get("productWidth");
    const productHeight = body.get("productHeight");
    const totalQuantity = body.get("totalQuantity");
    const totalWeight = body.get("totalWeight");
    const totalPrice = body.get("totalPrice");
    const productCollectionPrice = body.get("productCollectionPrice");
    const serviceMatch = body.get("serviceMatch");
    const productNote = body.get("productNote");
    const productMainName = body.get("productMainName");
    const productMainDes = body.get("productMainDes");
    const collectionOptions = body.get("collectionOptions");

    const listProductsItem = JSON.parse(body.get("listProductsItem"));

    if (_action === "CHECK_SERVICE") {
      const responseServiceList = await axios.post(
        `https://partner.viettelpost.vn/v2/order/getPriceAll`,
        {
          SENDER_DISTRICT:
            inventory === "Nhập thủ công"
              ? senderDistrict
              : inventory?.districtId,
          SENDER_PROVINCE:
            inventory === "Nhập thủ công"
              ? senderProvince
              : inventory?.provinceId,
          RECEIVER_DISTRICT: receiveProvince,
          RECEIVER_PROVINCE: receiveDistrict,
          PRODUCT_TYPE: valueProductType,
          PRODUCT_WEIGHT: totalWeight,
          PRODUCT_PRICE: totalPrice,
          MONEY_COLLECTION: productCollectionPrice,
          PRODUCT_LENGTH: productLength,
          PRODUCT_WIDTH: productWidth,
          PRODUCT_HEIGHT: productHeight,
          TYPE: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Token: token,
            // Cookie: "SERVERID=A"
          },
        }
      );

      return {
        action: "GET_SERVICE",
        data: responseServiceList?.data,
      };
    } else if (_action === "CHECK_PRICES") {
      const responsePricesEstimate = await axios.post(
        `https://partner.viettelpost.vn/v2/order/getPrice`,
        {
          PRODUCT_WEIGHT: totalWeight,
          PRODUCT_PRICE: totalPrice,
          MONEY_COLLECTION: productCollectionPrice,
          ORDER_SERVICE_ADD: "",
          ORDER_SERVICE: serviceMatch,
          SENDER_DISTRICT:
            inventory === "Nhập thủ công"
              ? senderDistrict
              : inventory?.districtId,
          SENDER_PROVINCE:
            inventory === "Nhập thủ công"
              ? senderProvince
              : inventory?.provinceId,
          RECEIVER_DISTRICT: receiveDistrict,
          RECEIVER_PROVINCE: receiveProvince,
          PRODUCT_LENGTH: productLength,
          PRODUCT_WIDTH: productWidth,
          PRODUCT_HEIGHT: productHeight,
          PRODUCT_TYPE: valueProductType,
          NATIONAL_TYPE: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Token: token,
            // Cookie: "SERVERID=A"
          },
        }
      );
      return {
        action: "CHECK_PRICES",
        data: responsePricesEstimate.data,
      };
    } else if (_action === "CREATE_ORDER") {
      // Tạo đơn
      function formatDateTime(dateTime) {
        const day = dateTime.getDate();
        const month = dateTime.getMonth() + 1;
        const year = dateTime.getFullYear();
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        const seconds = dateTime.getSeconds();

        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

        return formattedDate;
      }

      // let rawData = {
      //   ORDER_NUMBER: "12",
      //   GROUPADDRESS_ID:
      //     inventory === "Nhập thủ công" ? 0 : inventory?.groupaddressId,
      //   CUS_ID: 722,
      //   DELIVERY_DATE: "11/10/2018 15:09:52",
      //   SENDER_FULLNAME:
      //     inventory === "Nhập thủ công" ? senderName : inventory?.name,
      //   SENDER_ADDRESS:
      //     "Số 5A ngách 22 ngõ 282 Kim Giang, Đại Kim, Hoàng Mai, Hà Nội",
      //   SENDER_PHONE:
      //     inventory === "Nhập thủ công" ? senderPhone : inventory?.phone,
      //   SENDER_EMAIL: "vanchinh.libra@gmail.com",
      //   SENDER_DISTRICT:
      //     inventory === "Nhập thủ công"
      //       ? senderDistrict
      //       : inventory?.districtId,
      //   SENDER_PROVINCE:
      //     inventory === "Nhập thủ công"
      //       ? senderProvince
      //       : inventory?.provinceId,
      //   SENDER_LATITUDE: 0,
      //   SENDER_LONGITUDE: 0,
      //   RECEIVER_FULLNAME: "Hoàng - Test",
      //   RECEIVER_ADDRESS: "1 NKKN P.Nguyễn Thái Bình, Quận 1, TP Hồ Chí Minh",
      //   RECEIVER_PHONE: "0907882792",
      //   RECEIVER_EMAIL: "hoangnh50@fpt.com.vn",
      //   RECEIVER_PROVINCE: 34,
      //   RECEIVER_DISTRICT: 390,
      //   RECEIVER_WARDS: 7393,
      //   RECEIVER_LATITUDE: 0,
      //   RECEIVER_LONGITUDE: 0,
      //   PRODUCT_NAME: "Máy xay sinh tố Philips HR2118 2.0L ",
      //   PRODUCT_DESCRIPTION: "Máy xay sinh tố Philips HR2118 2.0L ",
      //   PRODUCT_QUANTITY: 1,
      //   PRODUCT_PRICE: 2292764,
      //   PRODUCT_WEIGHT: 40000,
      //   PRODUCT_LENGTH: 38,
      //   PRODUCT_WIDTH: 24,
      //   PRODUCT_HEIGHT: 25,
      //   PRODUCT_TYPE: "HH",
      //   ORDER_PAYMENT: 3,
      //   ORDER_SERVICE: "VCBO",
      //   ORDER_SERVICE_ADD: "",
      //   ORDER_VOUCHER: "",
      //   ORDER_NOTE: "cho xem hàng, không cho thử",
      //   MONEY_COLLECTION: 2292764,
      //   // "CHECK_UNIQUE": true,
      //   LIST_ITEM: [
      //     {
      //       PRODUCT_NAME: "Máy xay sinh tố Philips HR2118 2.0L ",
      //       PRODUCT_PRICE: 2150000,
      //       PRODUCT_WEIGHT: 2500,
      //       PRODUCT_QUANTITY: 1,
      //     },
      //   ],
      // };
      const rawData = {
        ORDER_NUMBER: params.orderId,
        GROUPADDRESS_ID:
          inventory === "Nhập thủ công" ? 0 : inventory?.groupaddressId,
        CUS_ID: inventory === "Nhập thủ công" ? "" : inventory?.cusId,
        DELIVERY_DATE: formatDateTime(new Date()),
        SENDER_FULLNAME:
          inventory === "Nhập thủ công" ? senderName : inventory?.name,
        SENDER_ADDRESS: senderFullAdress,
        SENDER_PHONE:
          inventory === "Nhập thủ công" ? senderPhone : inventory?.phone,
        SENDER_EMAIL: senderEmail,
        SENDER_DISTRICT:
          inventory === "Nhập thủ công"
            ? senderDistrict
            : inventory?.districtId,
        SENDER_PROVINCE:
          inventory === "Nhập thủ công"
            ? senderProvince
            : inventory?.provinceId,
        SENDER_WARD: senderWard,
        SENDER_LATITUDE: 0,
        SENDER_LONGITUDE: 0,
        RECEIVER_FULLNAME: receiveName,
        RECEIVER_ADDRESS: receiveFullAddress,
        RECEIVER_PHONE: receivePhone,
        RECEIVER_EMAIL: receiveEmail,
        RECEIVER_PROVINCE: receiveProvince,
        RECEIVER_DISTRICT: receiveDistrict,
        RECEIVER_WARDS: receiveWard,
        RECEIVER_LATITUDE: 0,
        RECEIVER_LONGITUDE: 0,
        PRODUCT_NAME: productMainName || listProductsItem[0]?.name,
        PRODUCT_DESCRIPTION: productMainDes,
        PRODUCT_QUANTITY: totalQuantity,
        PRODUCT_PRICE: totalPrice,
        PRODUCT_WEIGHT: totalWeight,
        PRODUCT_LENGTH: productLength,
        PRODUCT_WIDTH: productWidth,
        PRODUCT_HEIGHT: productHeight,
        PRODUCT_TYPE: valueProductType,
        ORDER_PAYMENT: Number(collectionOptions),
        ORDER_SERVICE: serviceMatch,
        ORDER_SERVICE_ADD: "",
        ORDER_VOUCHER: "",
        ORDER_NOTE: productNote,
        MONEY_COLLECTION: productCollectionPrice,
        CHECK_UNIQUE: false,
        LIST_ITEM: listProductsItem?.map((product) => {
          return {
            PRODUCT_NAME: product?.name,
            PRODUCT_PRICE: product?.price,
            PRODUCT_WEIGHT: product?.weight,
            PRODUCT_QUANTITY: product?.quan,
          };
        }),
      };

      const { admin } = await authenticate.admin(request);
      let responseAllSuccess = {};
      const dataAction = await axios.post(
        "https://partner.viettelpost.vn/v2/order/createOrder",
        rawData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.API_TOKEN}`,
            token: token,
          },
        }
      );
      try {
        createMetafield(params.orderId, dataAction?.data?.data?.ORDER_NUMBER);
        responseAllSuccess = dataAction.data;
      } catch (err) {}
      return { action: "CREATE_ORDER", data: responseAllSuccess };
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
    } else if (_action == "GET_SENDER") {
      const listInventoryRes = await axios.get(
        "https://partner.viettelpost.vn/v2/user/listInventory",
        {
          headers: {
            token: token,
            // "Accept": "application/json, text/plain, */*",
            accept: "*/*",
            Authorization: `Bearer ${process.env.API_TOKEN}`,
          },
        }
      );
      return {
        action: "GET_SENDER",
        data: listInventoryRes?.data,
      };
    }
  } else {
    return "no token";
  }
}

export default function CreateViettelPost() {
  const navigate = useNavigate();

  // loading ss

  const [isLoadingGetSender, setIsLoadingGetSender] = useState(false);
  const [isLoadingCheckServices, setIsLoadingCheckServices] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  const checkToken = localStorage.getItem("token") || "";
  if (!checkToken || checkToken === "undefined") {
    navigate("/app/login");
  }
  const dataAction = useActionData();
  const submit = useSubmit();
  const [token, setToken] = useState("");

  const shopOrdersData = useLoaderData();

  let inventoryList = [];
  const [selectedInventory, setSelectedInventory] = useState("");
  const [optionsInventory, setOptionsInventory] = useState(inventoryList);

  const [senderName, setSenderName] = useState("");
  const [actionForm, setActionForm] = useState("");
  const [senderPhone, setSenderPhone] = useState(
    shopOrdersData.order.phone || ""
  );

  const [receiveName, setReceiveName] = useState(
    shopOrdersData.order?.customer?.displayName || ""
  );
  const [receivePhone, setReceivePhone] = useState(
    shopOrdersData.order?.customer?.phone ||
      shopOrdersData.order?.customer?.defaultAddress?.phone ||
      ""
  );

  const provinceData = shopOrdersData.provinceResponse;
  // console.log("ds Tỉnh==>", provinceData.data);
  const [senderEmail, setSenderEmail] = useState(
    shopOrdersData.order.email || ""
  );
  const [receiveEmail, setReceiveEmail] = useState(
    shopOrdersData?.order?.customer?.defaultAddress?.email || ""
  );

  const [senderSoNha, setSenderSoNha] = useState("");
  const [receiveSoNha, setReceiveSoNha] = useState("");

  const [selectedProvinceSender, setSelectedProvinceSender] = useState("1");
  const [selectedDistrictSender, setSelectedDistrictSender] = useState("1100");
  const [optionsDistrictSender, setOptionsDistrictSender] = useState([]);
  const [selectedWardSender, setSelectedWardSender] = useState("1");
  const [optionsWardSender, setOptionsWardSender] = useState([]);

  const [selectedProvinceReceive, setSelectedProvinceReceive] = useState("1");
  const [selectedDistrictReceive, setSelectedDistrictReceive] =
    useState("1100");
  const [optionsDistrictReceive, setOptionsDistrictReceive] = useState([]);
  const [selectedWardReceive, setSelectedWardReceive] = useState("1");
  const [optionsWardReceive, setOptionsWardReceive] = useState([]);

  const [optionsCollection] = useState([
    {
      label: "Không thu hộ",
      value: (1).toString(),
    },
    {
      label: "Thu hộ tiền hàng và tiền cước",
      value: (2).toString(),
    },
    {
      label: "Thu hộ tiền hàng",
      value: (3).toString(),
    },
    {
      label: "Thu hộ tiền cước",
      value: (4).toString(),
    },
  ]);
  const [selectedCollection, setSelectedCollection] = useState("3");

  const [valueProductType, setValueProductType] = useState("buukien");

  const [listProductsItem, setListProductsItem] = useState([
    {
      name: "",
      quan: 0,
      weight: 0,
      price: 0,
    },
  ]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalLength, setTotalLength] = useState("");
  const [totalWidth, setTotalWidth] = useState("");
  const [totalHeight, setTotalHeight] = useState("");
  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date("Tue Sep 09 2023 00:00:00 GMT-0500 (EST)"),
    end: new Date("Tue Sep 09 2023 00:00:00 GMT-0500 (EST)"),
  });

  const [productMainName, setProductMainName] = useState(
    listProductsItem[0].name
  );
  const [productMainDes, setProductMainDes] = useState("");
  const [productMainNote, setProductMainNote] = useState("");
  const [productCollectionPrice, setProductCollectionPrice] = useState(0);

  const [selectedServiceMatch, setSelectedServiceMatch] = useState();
  const [optionsServiceMatch, setOptionsServiceMatch] = useState([]);

  const [pricesEstimate, setPricesEstimate] = useState({});

  const handleMonthChangeDeliveryExpectation = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  useEffect(() => {
    console.log("Action data nè: ====?", dataAction);
    if (dataAction) {
      if (dataAction === "no token") {
        navigate("/app/login");
      } else {
        if (dataAction.action === "GET_SERVICE") {
          setIsLoadingCheckServices(false);
          if (dataAction?.data?.error) {
            alert(dataAction?.data?.message);
          } else {
            setOptionsServiceMatch(
              dataAction?.data?.map((s) => {
                return {
                  label: s?.TEN_DICHVU,
                  value: s?.MA_DV_CHINH,
                };
              })
            );
          }
        }
        if (dataAction.action === "CHECK_PRICES") {
          setIsLoadingPrices(false);
          if (dataAction?.data?.error) {
            alert(dataAction?.data?.message);
          } else {
            setPricesEstimate(dataAction?.data?.data);
          }
        }
        if (dataAction.action === "CREATE_ORDER") {
          if (dataAction?.data?.error) {
            alert(dataAction?.data?.message);
          } else {
            alert(
              `Tạo đơn #${dataAction?.data?.data?.ORDER_NUMBER} Thành Công!!!`
            );
            navigate("/app");
          }
        }
        if (dataAction.action === "GET_SENDER") {
          let invenTemp = dataAction?.data.data?.map((value) => {
            return {
              label: `${value.name} - ${value.address} - ${value.phone}`,
              value: JSON.stringify(value),
            };
          });
          invenTemp = [
            ...invenTemp,
            {
              label: "Nhập thủ công",
              value: "Nhập thủ công",
            },
          ];
          setIsLoadingGetSender(false);
          setOptionsInventory(invenTemp);
          console.log("inven in use==>", invenTemp);
        }
      }
    }
  }, [dataAction]);
  useEffect(() => {
    const getDis = async () => {
      const responseDistrict = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listDistrict?provinceId=${selectedProvinceSender}`
      );
      // console.log("dis lists==>", responseDistrict);
      if (!responseDistrict.data.error) {
        setOptionsDistrictSender(
          responseDistrict.data.data?.map((value) => {
            return {
              label: value.DISTRICT_NAME,
              value: value.DISTRICT_ID.toString(),
            };
          })
        );
      } else {
        responseDistrict.data.message;
      }
    };
    getDis().catch(console.error);
  }, [selectedProvinceSender]);
  useEffect(() => {
    const getDis = async () => {
      const responseDistrict = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listDistrict?provinceId=${selectedProvinceReceive}`
      );
      // console.log("dis lists==>", responseDistrict);
      if (!responseDistrict.data.error) {
        setOptionsDistrictReceive(
          responseDistrict.data.data?.map((value) => {
            return {
              label: value.DISTRICT_NAME,
              value: value.DISTRICT_ID.toString(),
            };
          })
        );
      } else {
        responseDistrict.data.message;
      }
    };
    getDis().catch(console.error);
  }, [selectedProvinceReceive]);

  useEffect(() => {
    const getWardsSender = async () => {
      const responseWard = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listWards?districtId=${selectedDistrictSender}`
      );
      // console.log("dis lists==>", responseWard);
      if (!responseWard.data.error) {
        setOptionsWardSender(
          responseWard.data.data?.map((value) => {
            return {
              label: value.WARDS_NAME,
              value: value.WARDS_ID.toString(),
            };
          })
        );
      } else {
        responseWard.data.message;
      }
    };
    getWardsSender().catch(console.error);
  }, [selectedDistrictSender]);

  useEffect(() => {
    const getWardsReceiver = async () => {
      const responseWard = await axios.get(
        `https://partner.viettelpost.vn/v2/categories/listWards?districtId=${selectedDistrictReceive}`
      );
      // console.log("dis lists==>", responseWard);
      if (!responseWard.data.error) {
        setOptionsWardReceive(
          responseWard.data.data?.map((value) => {
            return {
              label: value.WARDS_NAME,
              value: value.WARDS_ID.toString(),
            };
          })
        );
      } else {
        responseWard.data.message;
      }
    };
    getWardsReceiver().catch(console.error);
  }, [selectedDistrictReceive]);

  const handleSelectChangeProvinceSender = useCallback(
    (value) => setSelectedProvinceSender(value),
    []
  );
  const handleSelectChangeDistrictSender = useCallback(
    (value) => setSelectedDistrictSender(value),
    []
  );
  const handleSelectChangeWardSender = useCallback(
    (value) => setSelectedWardSender(value),
    []
  );
  const handleSelectChangeProvinceReceive = useCallback(
    (value) => setSelectedProvinceReceive(value),
    []
  );
  const handleSelectChangeDistrictReceive = useCallback(
    (value) => setSelectedDistrictReceive(value),
    []
  );
  const handleSelectChangeWardReceive = useCallback(
    (value) => setSelectedWardReceive(value),
    []
  );
  const handleSelectChangeServiceMatch = useCallback(
    (value) => setSelectedServiceMatch(value),
    []
  );
  const handleSelectChangeCollection = useCallback(
    (value) => setSelectedCollection(value),
    []
  );
  const optionsProvince = provinceData.data?.map((value) => {
    return {
      label: value.PROVINCE_NAME,
      value: value.PROVINCE_ID.toString(),
    };
  });
  const handleSelectChangeInventory = useCallback((value) => {
    console.log("value: " + value);
    setSelectedInventory(value);
  }, []);
  // console.log("opt", optionsProvince);
  const [orders, setOrders] = useState(shopOrdersData.order);
  console.log("order==>", orders);
  const params = useParams();
  const orderId = params.orderId;

  function formatDate(dateString) {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7); // Thêm 7 giờ để chuyển múi giờ
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
  function formatDateTime(dateTime) {
    const day = dateTime.getDate();
    const month = dateTime.getMonth() + 1;
    const year = dateTime.getFullYear();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const seconds = dateTime.getSeconds();

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }

  const handleChangeProductType = useCallback(
    (_, newValue) => setValueProductType(newValue),
    []
  );

  useEffect(() => {
    let totalQuan = 0;
    let totalWeight = 0;
    let totalPrice = 0;
    listProductsItem.forEach((value) => {
      totalQuan += value.quan;
      totalWeight += value.weight;
      totalPrice += value.price;
    });
    setTotalQuantity(totalQuan);
    setTotalWeight(totalWeight);
    setTotalPrice(totalPrice);
  }, [listProductsItem]);

  useEffect(() => {
    console.log("inven xử lý", selectedInventory);
  }, [selectedInventory]);
  // console.log("date post==>", {
  //   ORDER_NUMBER: params.orderId,
  //   GROUPADDRESS_ID: 0,
  //   CUS_ID: "",
  //   DELIVERY_DATE: formatDateTime(new Date()),
  //   SENDER_FULLNAME: senderName,
  //   SENDER_ADDRESS: `${senderSoNha ? senderSoNha + "," : ""} ${
  //     optionsWardSender?.find((w) => w?.value == selectedWardSender)?.label ||
  //     ""
  //   }, ${
  //     optionsDistrictSender?.find((dis) => dis?.value == selectedDistrictSender)
  //       ?.label || ""
  //   }, ${
  //     optionsProvince.find((value) => value.value == selectedProvinceSender)
  //       .label || ""
  //   }`,
  //   SENDER_PHONE: senderPhone,
  //   SENDER_EMAIL: senderEmail,
  //   SENDER_DISTRICT: selectedDistrictSender,
  //   SENDER_PROVINCE: selectedProvinceSender,
  //   SENDER_WARD: selectedWardSender,
  //   SENDER_LATITUDE: 0,
  //   SENDER_LONGITUDE: 0,
  //   RECEIVER_FULLNAME: receiveName,
  //   RECEIVER_ADDRESS: `${receiveSoNha ? receiveSoNha + "," : ""} ${
  //     optionsWardReceive?.find((w) => w?.value == selectedWardReceive)?.label ||
  //     ""
  //   }, ${
  //     optionsDistrictReceive?.find(
  //       (dis) => dis?.value == selectedDistrictReceive
  //     )?.label || ""
  //   }, ${
  //     optionsProvince.find((value) => value.value == selectedProvinceReceive)
  //       .label || ""
  //   }`,
  //   RECEIVER_PHONE: receivePhone,
  //   RECEIVER_EMAIL: receiveEmail,
  //   RECEIVER_PROVINCE: selectedProvinceReceive,
  //   RECEIVER_DISTRICT: selectedDistrictReceive,
  //   RECEIVER_WARDS: selectedWardReceive,
  //   RECEIVER_LATITUDE: 0,
  //   RECEIVER_LONGITUDE: 0,
  //   EXPECTED_DELIVERY_DATE: formatDate(selectedDates.end),
  //   PRODUCT_NAME: productMainName,
  //   PRODUCT_DESCRIPTION: productMainDes,
  //   PRODUCT_QUANTITY: totalQuantity,
  //   PRODUCT_PRICE: totalPrice,
  //   PRODUCT_WEIGHT: totalWeight,
  //   PRODUCT_LENGTH: 0,
  //   PRODUCT_WIDTH: 0,
  //   PRODUCT_HEIGHT: 0,
  //   PRODUCT_TYPE: valueProductType === "tailieu" ? "TH" : "HH",
  //   ORDER_PAYMENT: selectedCollection,
  //   ORDER_SERVICE: "VCBO",
  //   ORDER_SERVICE_ADD: "",
  //   ORDER_VOUCHER: "",
  //   ORDER_NOTE: productMainNote,
  //   MONEY_COLLECTION: productCollectionPrice,
  //   CHECK_UNIQUE: true,
  //   LIST_ITEM: listProductsItem.map((value) => {
  //     return {
  //       PRODUCT_NAME: value.name,
  //       PRODUCT_PRICE: value.price,
  //       PRODUCT_WEIGHT: value.weight,
  //       PRODUCT_QUANTITY: value.quan,
  //     };
  //   }),
  // });
  return (
    <Page>
      <Layout>
        <div>
          <Text variant="heading3xl" as="h2">
            Create ViettelPost #{orderId}
          </Text>
        </div>
        <Layout.Section>
          <Card>
            <Form method="post">
              <input type="hidden" name="_action" value={actionForm} />
              <input type="hidden" name="token" value={token} />
              <FormLayout>
                <Button
                  plain
                  textAlign="left"
                  url={`https://admin.shopify.com/store/${shopOrdersData.shop}/orders/${orderId}`}
                  target="_blank"
                >
                  Edit order: #{orderId} --- Name: {shopOrdersData.order.name}📝
                </Button>
                <TextField
                  label="Shopify Order .No:"
                  value={`#${params.orderId}`}
                  readOnly
                  autoComplete="off"
                />
                <b>NGƯỜI GỬI:</b>

                <Button
                  submit
                  loading={isLoadingGetSender}
                  onClick={() => {
                    setIsLoadingGetSender(true);
                    setToken(localStorage.getItem("token") || "");
                    setActionForm("GET_SENDER");
                  }}
                >
                  Lấy danh sách người gửi
                </Button>
                <Select
                  label=""
                  name="inventory"
                  options={optionsInventory}
                  onChange={handleSelectChangeInventory}
                  value={selectedInventory}
                />

                {selectedInventory === "Nhập thủ công" ? (
                  <FormLayout.Group>
                    <FormLayout.Group>
                      <TextField
                        label="Tên Người Gửi:"
                        value={senderName}
                        name="senderName"
                        onChange={(value) => {
                          setSenderName(value);
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        label="Số điện thoại người gửi:"
                        value={senderPhone}
                        name="senderPhone"
                        type="tel"
                        onChange={(value) => {
                          setSenderPhone(value);
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        label="Email người gửi:"
                        value={senderEmail}
                        name="senderEmail"
                        type="email"
                        onChange={(value) => {
                          setSenderEmail(value);
                        }}
                        autoComplete="off"
                      />
                    </FormLayout.Group>
                    <Card>
                      <FormLayout.Group>
                        <i>Địa chỉ người gửi:</i>
                        <Select
                          label="Thành Phố/Tỉnh:"
                          options={optionsProvince}
                          name="senderProvince"
                          onChange={handleSelectChangeProvinceSender}
                          value={selectedProvinceSender}
                        />
                        <Select
                          label="Quận/Huyện:"
                          options={optionsDistrictSender}
                          name="senderDistrict"
                          onChange={handleSelectChangeDistrictSender}
                          value={selectedDistrictSender}
                        />
                        <Select
                          label="Phường/Xã:"
                          name="senderWard"
                          options={optionsWardSender}
                          onChange={handleSelectChangeWardSender}
                          value={selectedWardSender}
                        />
                        <TextField
                          label="Số Nhà, Tên Đường:"
                          value={senderSoNha}
                          onChange={(value) => {
                            setSenderSoNha(value);
                          }}
                          autoComplete="off"
                        />
                        <TextField
                          readOnly
                          label="Địa chỉ tự động:"
                          value={`${senderSoNha ? senderSoNha + "," : ""} ${
                            optionsWardSender?.find(
                              (w) => w?.value == selectedWardSender
                            )?.label || ""
                          }, ${
                            optionsDistrictSender?.find(
                              (dis) => dis?.value == selectedDistrictSender
                            )?.label || ""
                          }, ${
                            optionsProvince.find(
                              (value) => value.value == selectedProvinceSender
                            ).label || ""
                          }`}
                          name="senderFullAdress"
                          autoComplete="off"
                        />
                      </FormLayout.Group>
                    </Card>
                  </FormLayout.Group>
                ) : (
                  <FormLayout.Group>
                    <TextField
                      label="Email người gửi:"
                      value={senderEmail}
                      name="senderEmail"
                      type="email"
                      onChange={(value) => {
                        setSenderEmail(value);
                      }}
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                )}

                <hr />
                <b>NGƯỜI NHẬN:</b>

                <FormLayout.Group>
                  <FormLayout.Group>
                    <TextField
                      label="Tên Người Nhận:"
                      name="receiveName"
                      value={receiveName}
                      onChange={(value) => {
                        setReceiveName(value);
                      }}
                      autoComplete="off"
                    />
                    <TextField
                      label="Số điện thoại người nhận:"
                      value={receivePhone}
                      name="receivePhone"
                      type="tel"
                      onChange={(value) => {
                        setReceivePhone(value);
                      }}
                      autoComplete="off"
                    />
                    <TextField
                      label="Email người nhận:"
                      value={receiveEmail}
                      name="receiveEmail"
                      type="email"
                      onChange={(value) => {
                        setReceiveEmail(value);
                      }}
                      autoComplete="off"
                    />
                    <Card>
                      <Text variant="headingMd" as="h6">
                        Thông tin khách hàng: <Button
                  plain
                  textAlign="left"
                  url={`https://admin.shopify.com/store/${shopOrdersData.shop}/customers/${shopOrdersData.order?.customer?.id.split('/')[shopOrdersData.order?.customer?.id.split('/').length-1]}`}
                  target="_blank"
                >
                  #View📝
                </Button>
                      </Text>
                      ➭<b>Tên người nhận:</b>{" "}
                      {shopOrdersData.order?.customer?.displayName || "_"}
                      <br />➭<b>Sđt:</b>{" "}
                      {shopOrdersData.order?.customer?.defaultAddress?.phone ||
                        "_"}
                      <br />➭<b>email:</b>{" "}
                      {shopOrdersData.order?.customer?.defaultAddress?.email ||
                        "_"}
                      <br />➭<b>Địa chỉ: </b>
                      {shopOrdersData.order?.customer?.defaultAddress
                        ?.address1 || "_"}
                      <br />
                      <br />
                      {shopOrdersData.order?.customer?.addresses?.map(
                        (value, index) => {
                          return (
                            <>
                              <Card>
                                <i>🏢Địa chỉ #{index + 1}:</i>
                                <Text variant="bodySm" as="p">
                                  Tên:{" "}
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    {value?.firstName + " " + value?.lastName ||
                                      "_"}
                                  </span>
                                </Text>{" "}
                                <Text variant="bodySm" as="p">
                                  Sđt:
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    {value?.phone || "_"}
                                  </span>
                                </Text>
                                <Text variant="bodySm" as="p">
                                  Địa chỉ:
                                  <br />
                                  <i> + Địa chỉ 1:</i>
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    {value?.address1 || "_"}
                                  </span>
                                  {value?.address2 ? (
                                    <>
                                      <br />
                                      <i> + Địa chỉ 2:</i>
                                      <span style={{ color: "green" }}>
                                        {" "}
                                        {value?.address2 || "_"}
                                      </span>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Text>
                              </Card>
                              <br />
                            </>
                          );
                        }
                      )}
                    </Card>
                  </FormLayout.Group>
                  <Card>
                    <FormLayout.Group>
                      <label>Địa chỉ người nhận:</label>
                      <Select
                        label="Thành Phố/Tỉnh:"
                        options={optionsProvince}
                        name="receiveProvince"
                        onChange={handleSelectChangeProvinceReceive}
                        value={selectedProvinceReceive}
                      />
                      <Select
                        label="Quận/Huyện:"
                        options={optionsDistrictReceive}
                        name="receiveDistrict"
                        onChange={handleSelectChangeDistrictReceive}
                        value={selectedDistrictReceive}
                      />
                      <Select
                        label="Phường/Xã:"
                        name="receiveWard"
                        options={optionsWardReceive}
                        onChange={handleSelectChangeWardReceive}
                        value={selectedWardReceive}
                      />
                      <TextField
                        label="Số Nhà, Tên Đường:"
                        value={receiveSoNha}
                        onChange={(value) => {
                          setReceiveSoNha(value);
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        readOnly
                        label="Địa chỉ tự động:"
                        value={`${receiveSoNha ? receiveSoNha + "," : ""} ${
                          optionsWardReceive?.find(
                            (w) => w?.value == selectedWardReceive
                          )?.label || ""
                        }, ${
                          optionsDistrictReceive?.find(
                            (dis) => dis?.value == selectedDistrictReceive
                          )?.label || ""
                        }, ${
                          optionsProvince.find(
                            (value) => value.value == selectedProvinceReceive
                          ).label || ""
                        }`}
                        name="receiveFullAddress"
                        autoComplete="off"
                      />
                    </FormLayout.Group>
                  </Card>
                </FormLayout.Group>

                <label>Chọn gian giao hàng dự kiến:</label>
                <DatePicker
                  month={month}
                  year={year}
                  onChange={setSelectedDates}
                  onMonthChange={handleMonthChangeDeliveryExpectation}
                  selected={selectedDates}
                />
                <hr />

                <b>Sản phẩm:</b>
                <FormLayout.Group>
                  {/* <FormLayout.Group> */}
                  <label>Loại sản phẩm:</label>
                  <RadioButton
                    label="Bưu kiện"
                    checked={valueProductType === "buukien"}
                    id="buukien"
                    name="buukien"
                    onChange={handleChangeProductType}
                  />
                  <RadioButton
                    label="Tài liệu"
                    id="tailieu"
                    name="tailieu"
                    checked={valueProductType === "tailieu"}
                    onChange={handleChangeProductType}
                  />
                  <input
                    type="hidden"
                    value={valueProductType}
                    name="radioTypes"
                  />
                </FormLayout.Group>
                <Divider />
                <label>Items:</label>
                {listProductsItem?.map((product, index) => {
                  return (
                    <>
                      <Card>
                        <FormLayout.Group title={`#Sản phẩm ${index + 1}:`}>
                          <TextField
                            label={`Tên hàng hóa:`}
                            placeholder="Tên hàng hóa"
                            value={product?.name}
                            onChange={(value) => {
                              let temp = [...listProductsItem];
                              temp[index].name = value;
                              setListProductsItem(temp);
                            }}
                            autoComplete="off"
                          />
                          <FormLayout.Group>
                            <TextField
                              label={`Số lượng:`}
                              placeholder=""
                              type="number"
                              value={product?.quan.toString()}
                              onChange={(value) => {
                                let temp = [...listProductsItem];
                                temp[index].quan = Number(value);
                                setListProductsItem(temp);
                              }}
                              autoComplete="off"
                            />
                            <TextField
                              label={`Khối lượng(g):`}
                              placeholder="g"
                              type="number"
                              value={product?.weight.toString()}
                              onChange={(value) => {
                                let temp = [...listProductsItem];
                                temp[index].weight = Number(value);
                                setListProductsItem(temp);
                              }}
                              autoComplete="off"
                            />
                            <TextField
                              label={`Giá trị(VNĐ):`}
                              placeholder="đ"
                              type="number"
                              value={product?.price.toString()}
                              onChange={(value) => {
                                let temp = [...listProductsItem];
                                temp[index].price = Number(value);
                                setListProductsItem(temp);
                              }}
                              autoComplete="off"
                            />
                          </FormLayout.Group>
                        </FormLayout.Group>
                        <Button
                          onClick={() => {
                            let temp = [...listProductsItem];
                            temp.splice(index, 1);
                            setListProductsItem(temp);
                            console.log("List Products", listProductsItem);
                          }}
                        >
                          🗑️
                        </Button>
                      </Card>
                      <br />
                    </>
                  );
                })}
                <input
                  type="hidden"
                  name="listProductsItem"
                  value={JSON.stringify(listProductsItem)}
                />
                <Button
                  destructive
                  onClick={() => {
                    let temp = [
                      ...listProductsItem,
                      {
                        name: "",
                        quan: 0,
                        weight: 0,
                        price: 0,
                      },
                    ];
                    setListProductsItem(temp);
                    console.log("List Products +", listProductsItem);
                  }}
                >
                  + Thêm Hàng Hóa
                </Button>
                <Divider />
                <label>Sản phẩm:</label>
                <FormLayout.Group>
                  <TextField
                    label="Tổng Số lượng:"
                    value={totalQuantity.toString()}
                    name="totalQuantity"
                    readOnly
                    autoComplete="off"
                  />
                  <TextField
                    label="Tổng Khối Lượng:"
                    value={totalWeight.toString()}
                    readOnly
                    name="totalWeight"
                    autoComplete="off"
                  />
                  <TextField
                    label="Tổng Giá:"
                    value={totalPrice.toString()}
                    name="totalPrice"
                    readOnly
                    autoComplete="off"
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    disabled
                    label="Tên Đơn Hàng:"
                    value={listProductsItem[0]?.name || productMainName}
                    onChange={(value) => {
                      setProductMainName(value);
                    }}
                    autoComplete="off"
                  />
                  <TextField
                    label="Mô Tả:"
                    value={productMainDes}
                    onChange={(value) => {
                      setProductMainDes(value);
                    }}
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <FormLayout.Group title="Kích thước:">
                  <TextField
                    label="Dài:"
                    placeholder="Dài(cm)"
                    value={totalLength}
                    onChange={(value) => {
                      setTotalLength(value);
                    }}
                    name="productLength"
                    autoComplete="off"
                  />
                  <TextField
                    label="Rộng:"
                    placeholder="Rộng(cm)"
                    value={totalWidth}
                    onChange={(value) => {
                      setTotalWidth(value);
                    }}
                    name="productWidth"
                    autoComplete="off"
                  />
                  <TextField
                    label="Cao:"
                    placeholder="Cao(cm)"
                    value={totalHeight}
                    onChange={(value) => {
                      setTotalHeight(value);
                    }}
                    name="productHeight"
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <Select
                  label="Thu hộ:"
                  options={optionsCollection}
                  name="collectionOptions"
                  onChange={handleSelectChangeCollection}
                  value={selectedCollection}
                />
                <Divider />
                <FormLayout.Group>
                  <TextField
                    label="Ghi Chú:"
                    value={productMainNote}
                    onChange={(value) => {
                      setProductMainNote(value);
                    }}
                    name="productNote"
                    autoComplete="off"
                  />
                  <TextField
                    label="Tiền Thu Hộ:"
                    value={productCollectionPrice.toString()}
                    onChange={(value) => {
                      setProductCollectionPrice(Number(value));
                    }}
                    name="productCollectionPrice"
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <Divider />
                <Button
                  submit
                  size="slim"
                  loading={isLoadingCheckServices}
                  onClick={() => {
                    setIsLoadingCheckServices(true);
                    setToken(localStorage.getItem("token") || "");
                    setActionForm("CHECK_SERVICE");
                  }}
                >
                  Kiểm tra dịch vụ phù hợp
                </Button>
                <Select
                  label="Dịch Vụ Phù Hợp:"
                  options={optionsServiceMatch}
                  onChange={handleSelectChangeServiceMatch}
                  value={selectedServiceMatch}
                  name="serviceMatch"
                />
                <Card roundedAbove="md" background="bg-subdued">
                  <Button
                    size="slim"
                    loading={isLoadingPrices}
                    submit
                    onClick={() => {
                      setIsLoadingPrices(true);
                      setToken(localStorage.getItem("token") || "");
                      setActionForm("CHECK_PRICES");
                    }}
                  >
                    Kiểm tra giá
                  </Button>
                  <br />
                  <br />
                  <Text variant="headingMd" as="h6">
                    Chi Phí Ước Tính:
                  </Text>

                  <FormLayout.Group>
                    <List type="bullet">
                      <List.Item>
                        <Text variant="headingMd" as="h6">
                          Tổng cước:{" "}
                          <span style={{ color: "green" }}>
                            {" "}
                            {pricesEstimate?.MONEY_TOTAL + " đ" ||
                              "Chưa đủ thông tin"}
                          </span>
                        </Text>
                      </List.Item>
                      <List.Item>
                        {" "}
                        <Text variant="headingMd" as="h6">
                          Cước dịch vụ chính:
                          <span style={{ color: "green" }}>
                            {" "}
                            {pricesEstimate?.MONEY_TOTAL_FEE + " đ" ||
                              "Chưa đủ thông tin"}
                          </span>
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text variant="headingMd" as="h6">
                          Phụ phí xăng dầu:
                          <span style={{ color: "green" }}>
                            {" "}
                            {pricesEstimate?.MONEY_FEE + " đ" ||
                              "Chưa đủ thông tin"}
                          </span>
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text variant="headingMd" as="h6">
                          Phụ phí thu hộ:
                          <span style={{ color: "green" }}>
                            {" "}
                            {pricesEstimate?.MONEY_COLLECTION_FEE + " đ" ||
                              "Chưa đủ thông tin"}
                          </span>
                        </Text>
                      </List.Item>
                    </List>
                    <List type="bullet">
                      <List.Item>
                        <Text variant="headingMd" as="h6">
                          Tổng thời gian giao hàng cam kết:
                          <span style={{ color: "green" }}>
                            {" "}
                            {pricesEstimate?.KPI_HT + " giờ" ||
                              "Chưa đủ thông tin"}
                          </span>
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text variant="headingMd" as="h6">
                          Phụ phí khác:
                          <span style={{ color: "green" }}>
                            {" "}
                            {pricesEstimate?.MONEY_OTHER_FEE + " đ" ||
                              "Chưa đủ thông tin"}
                          </span>
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text variant="headingMd" as="h6">
                          Thuế giá trị gia tăng:
                          <span style={{ color: "green" }}>
                            {" "}
                            {pricesEstimate?.MONEY_VAT + " đ" ||
                              "Chưa đủ thông tin"}
                          </span>
                        </Text>
                      </List.Item>
                    </List>
                  </FormLayout.Group>
                </Card>
                <Button
                  submit
                  destructive
                  onClick={() => {
                    setToken(localStorage.getItem("token") || "");
                    setActionForm("CREATE_ORDER");
                  }}
                >
                  Tạo Đơn Viettel Post
                </Button>
              </FormLayout>
            </Form>
            {/* <br /> */}
            <br />
            <Link to="/app">Back to Home page</Link>
          </Card>
        </Layout.Section>
      </Layout>
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
