import { Form, Input, notification, Select, Divider } from "antd";
import UICPopup from "@app/components/core/popup/cpopup";
import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { GET, POST } from "@app/request";
import UIButton from "@app/components/core/button";
import { getBase64 } from "@app/utils";
import CancelIcon from "@app/resources/images/cancel.svg";
import { EMAIL } from "@app/configs";
import axios from "axios";
import CheckedIcon from "@app/resources/images/checked_checkbox_Color.svg";
import UnCheckedIcon from "@app/resources/images/unchecked_checkbox.svg";

export const PremiumServer = ({
  onCloseServe,
  isPremium = true,
  cb,
  data = undefined,
  user,
}) => {
  let fileSelector = undefined;
  const [countries, setCountry] = React.useState([]);
  const [states, setState] = React.useState([]);
  const [errorState, setErrorState] = React.useState(false);
  const [streamingCategory, setStreamingCategory] = useState(
    data?.streamingCategory || []
  );
  const [formData, setFormData] = React.useState({
    country: "",
    countryCode: "",
    ipAddress: "",
    premium: isPremium,
    state: "",
    status: false,
    recommend: false,
    category: "",
    categories: [],
    // streamingCategory: [],
    caFile: "",
    caFileName: "",
    ovpnFile: "",
    ovpnName: "",
    u_nsm: "",
    p_nsm: "",
    publicKey: "",
    presharedKey: "",
    privateKey: "",
    internalAddress: "",
    port: "",
    proxyPort: "",
    proxyUsername: "",
    proxyPassword: "",
  });

  const validateSchema = Yup.object({
    country: Yup.string().required("Please select server"),
    ipAddress: Yup.string().required("Please input ip address"),
    u_nsm: Yup.string().required("Please input username"),
    p_nsm: Yup.string().required("Please input password"),
    status: Yup.string().required("Please select status"),
    recommend: Yup.boolean().required("Please select recommend"),
    categories: Yup.array()
      .of(
        Yup.string().oneOf(
          ["Gaming", "Streaming", "Connection", "Default"],
          "Invalid category"
        )
      )
      .min(1, "Please select at least one category")
      .required("Please select categories"),
    caFile: Yup.string().required("Please upload cert file (*.pem)*"),
    ovpnFile: Yup.string().required("Please upload ovpn file (*.OVPN)*"),
    publicKey: Yup.string().required("Please input publicKey"),
    presharedKey: Yup.string().required("Please input presharedKey"),
    privateKey: Yup.string().required("Please input privateKey"),
    internalAddress: Yup.string().required("Please input internalAddress"),
    port: Yup.number()
      .required("Please input port.")
      .typeError("you must specify a number"), // Sets it as a compulsory field
    proxyPort: Yup.number().nullable().notRequired(),
    proxyUsername: Yup.string().nullable().notRequired(),
    proxyPassword: Yup.string().nullable().notRequired(),
  });

  React.useEffect(() => {
    fetchCountries();

    if (data) {
      setFormData({
        ...formData,
        country: data?.country,
        countryCode: data?.countryCode,
        status: data?.status,
        recommend: data?.recommend,
        category: data?.category,
        categories: data?.categories,
        ipAddress: data?.ipAddress,
        caFileName: data?.caFileName,
        ovpnName: data?.ovpnName,
        state: data?.state,
        caFile: data?.caFile,
        ovpnFile: data?.ovpnFile,
        u_nsm: data?.u_nsm,
        p_nsm: data?.p_nsm,
        streamingCategory: data?.streamingCategory,
        publicKey: data?.publicKey,
        presharedKey: data?.presharedKey,
        privateKey: data?.privateKey,
        internalAddress: data?.internalAddress,
        port: data?.port,
        proxyPort: data?.proxyPort,
        proxyUsername: data?.proxyUsername,
        proxyPassword: data?.proxyPassword,
      });
    }
  }, []);

  // useEffect(() => {
  //   const fetchCountries = async () => {
  //     const requestBody = {
  //       adminId: user?.id,
  //       id: user?.id,
  //     };

  //     try {
  //       const response = await POST('/admin/country/v4/get', requestBody);
  //       const data = response.data;
  //       console.log('===>check data country', data);
  //       setCountry(data?.data || []);

  //       if (data) {
  //         filterState(data?.countryCode, data?.data || []);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching countries:', err);
  //     }
  //   };

  //   fetchCountries();
  // }, [user?.id]);

  // lưu cache country
  const fetchCountries = async () => {
    const cachedCountries = localStorage.getItem("countriesData");

    if (cachedCountries) {
      // Nếu đã có dữ liệu trong cache => use it
      const parsedData = JSON.parse(cachedCountries);
      setCountry(parsedData);

      if (data) {
        filterState(data?.countryCode, parsedData);
      }
    } else {
      // Nếu chưa có dữ liệu trong cache => call API
      const requestBody = {
        adminId: user?.id,
        id: user?.id,
      };

      try {
        const res = await POST("/admin/country/v4/get", requestBody);
        console.log("===>check data country", res?.data);

        const countryData = res?.data?.data || [];
        setCountry(countryData);
        localStorage.setItem("countriesData", JSON.stringify(countryData));

        if (data) {
          filterState(data?.countryCode, countryData);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const filterState = (countryCode, list) => {
    const filtered = list.filter(
      (item) => (item?.iso2).toLowerCase() === countryCode
    );

    setState(filtered?.[0]?.states);
  };

  const removeError = ({ errors, name, setErrors }) => {
    const newErrors = { ...errors };
    delete newErrors?.[name];
    setErrors({ ...newErrors });
  };

  const handleFileSelect = () => {
    fileSelector?.click();
  };

  const onChoose = (
    event,
    setFieldValue,
    errors,
    setErrors,
    contentName = "caFile",
    fileName = "caFileName"
  ) => {
    const file = event.target.files[0];

    // const tmppath = URL.createObjectURL(file);
    getBase64(file)
      .then((content) => {
        let tmp = content?.split("base64,")?.[1] || "";
        setFieldValue(contentName, tmp, false);
        setFieldValue(fileName, file?.name, false);
        removeError({
          errors,
          name: contentName,
          setErrors,
        });
      })
      .catch();
  };
  const onChooseOvpn = (
    event,
    setFieldValue,
    errors,
    setErrors,
    contentNameOvpn = "ovpnFile",
    fileNameOvpn = "ovpnName"
  ) => {
    const file = event.target.files[0];

    // const tmppath = URL.createObjectURL(file);
    getBase64(file)
      .then((content) => {
        let tmp = content?.split("base64,")?.[1] || "";
        setFieldValue(contentNameOvpn, tmp, false);
        setFieldValue(fileNameOvpn, file?.name, false);
        removeError({
          errors,
          name: contentNameOvpn,
          setErrors,
        });
      })
      .catch();
  };

  const buildFileSelector = ({
    setFieldValue,
    errors,
    setErrors,
    contentName = "caFile",
    fileName = "caFileName",
    accept = ".pem",
  }) => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.setAttribute("name", "file");
    fileSelector.setAttribute("accept", accept);
    fileSelector.onchange = (e) => {
      onChoose(e, setFieldValue, errors, setErrors, contentName, fileName);
      fileSelector.value = "";
    };

    return fileSelector;
  };

  const buildFileSelectorOvpn = ({
    setFieldValue,
    errors,
    setErrors,
    contentNameOvpn = "ovpnFile",
    fileNameOvpn = "ovpnName",
    accept = ".OVPN",
  }) => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.setAttribute("name", "file");
    fileSelector.setAttribute("accept", accept);
    fileSelector.onchange = (e) => {
      onChooseOvpn(
        e,
        setFieldValue,
        errors,
        setErrors,
        contentNameOvpn,
        fileNameOvpn
      );
      fileSelector.value = "";
    };

    return fileSelector;
  };

  const create = (values, url = "/admin/server/create", isUpdated = false) => {
    if (states.length !== 0 && !values?.state) {
      setErrorState(true);
      return;
    }
    if (streamingCategory.length !== 0 && !values?.streamingCategory) {
      setErrorState(true);
      return;
    }

    POST(url, { ...values, adminId: user?.id })
      .then(() => {
        notification.info({
          description: `${values?.country} server was ${
            isUpdated ? "updated" : "created"
          } successfully`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification info",
        });
        onCloseServe();
        cb();
      })
      .catch((err) => {
        notification.info({
          description: `${values?.country} server was ${
            isUpdated ? "updated" : "created"
          } failure`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification error",
        });
      });
  };

  React.useEffect(() => {}, []);

  const isAllow = user?.email && user?.email?.toLowerCase() !== EMAIL;

  const [options, setOption] = useState([
    "Default",
    "Gaming",
    "Streaming",
    "Connection",
  ]);

  return (
    <UICPopup
      hiddenFooter={true}
      onCancel={onCloseServe}
      textCancel="Cancel"
      textOk="Save"
      title={`${data ? "Update" : "New"} ${
        isPremium ? "Premium" : "Free"
      } Server`}
      width={850}
    >
      <Formik
        onSubmit={(e) => {
          console.log("update or create");
          console.log(e);
          if (isAllow) {
            if (!data) {
              create(e);
            } else {
              create(
                {
                  ...e,
                  id: data?.id,
                  adminId: user?.id,
                  categories: e.categories,
                  streamingCategory: e.streamingCategory,
                },
                "/admin/server/update",
                true
              );
            }
          }
        }}
        validationSchema={validateSchema}
        initialValues={formData}
        enableReinitialize
      >
        {({ setErrors, setFieldValue, errors, values, handleSubmit }) => {
          return (
            <Form
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              onFinish={handleSubmit}
              className="block w-full"
            >
              <Form.Item
                hasFeedback={!!errors["country"]}
                validateStatus={errors["country"] && "error"}
                help={errors["country"]}
                className="core-form-item w-full mb-2 block"
                label="server name"
              >
                <Select
                  showSearch
                  value={values?.country || undefined}
                  optionFilterProp="children"
                  onChange={(e, a) => {
                    setFieldValue("country", e, false);
                    setFieldValue("countryCode", a?.["data-id"], false);
                    removeError({
                      errors,
                      name: "country",
                      setErrors,
                    });
                    let arrStates = JSON.parse(a?.["data-states"] || "");
                    if (arrStates.length === 0) {
                      arrStates = [
                        {
                          id: a?.["data-id"],
                          name: e,
                          state_code: a?.["data-id"],
                        },
                      ];
                    }
                    setState(arrStates);
                  }}
                  filterOption={(input, option) =>
                    option?.value.toLowerCase().indexOf(input?.toLowerCase()) >=
                    0
                  }
                  placeholder="Select server name"
                  className="w-full"
                >
                  {countries?.map((item) => (
                    <Select.Option
                      key={item?.id}
                      data-id={(item?.iso2).toLowerCase()}
                      data-states={JSON.stringify(item?.states)}
                      value={item?.name}
                    >
                      <div className="flex items-center">
                        <img
                          className="rounded-full mr-2"
                          style={{ border: "2px solid #f5f5f5" }}
                          src={`/flags/${(item?.iso2).toLowerCase()}.svg`}
                          width={24}
                          height={24}
                        />
                        <div style={{ marginTop: 2 }}>{item?.name}</div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                hasFeedback={errorState}
                validateStatus={errorState && "error"}
                help={errorState && "Please select state"}
                className="core-form-item w-full mb-2 block"
                label="state"
              >
                <Select
                  optionFilterProp="children"
                  showSearch
                  filterOption={(input, option) =>
                    option?.value.toLowerCase().indexOf(input?.toLowerCase()) >=
                    0
                  }
                  onChange={(e) => {
                    setFieldValue("state", e, false);
                    setErrorState(false);
                    removeError({
                      errors,
                      name: "state",
                      setErrors,
                    });
                  }}
                  placeholder="Select state"
                  value={values?.state || undefined}
                  className="w-full"
                >
                  {states &&
                    states.map((state) => (
                      <Select.Option key={state?.id} value={state?.name}>
                        {state?.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["status"]}
                validateStatus={errors["status"] && "error"}
                help={errors["status"]}
                className="core-form-item w-full mb-2 block"
                label="Status"
              >
                <Select
                  onChange={(value) => {
                    setFieldValue("status", value, false);
                    removeError({
                      errors,
                      name: "status",
                      setErrors,
                    });
                  }}
                  placeholder="Enable"
                  value={values?.status}
                  className="w-full"
                >
                  <Select.Option value={true}>Enable</Select.Option>
                  <Select.Option value={false}>Disabled</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["recommend"]}
                validateStatus={errors["recommend"] && "error"}
                help={errors["recommend"]}
                className="core-form-item w-full mb-2 block"
                label="Recommend"
              >
                <Select
                  onChange={(value) => {
                    setFieldValue("recommend", value, false);
                    removeError({
                      errors,
                      name: "recommend",
                      setErrors,
                    });
                  }}
                  placeholder="Recommend"
                  value={values?.recommend}
                  className="w-full"
                >
                  <Select.Option value={true}>True</Select.Option>
                  <Select.Option value={false}>False</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                hasFeedback={!!errors["categories"]}
                validateStatus={errors["categories"] && "error"}
                help={errors["categories"]}
                className="core-form-item w-full mb-2 block"
                label="Category"
              >
                <Select
                  mode="multiple"
                  onChange={(value) => {
                    console.log(value);
                    setFieldValue("categories", value, false);
                    removeError({
                      errors,
                      name: "categories",
                      setErrors,
                    });
                  }}
                  placeholder="Select categories"
                  value={values?.categories}
                  className="w-full"
                >
                  {options.map((option) => (
                    <Select.Option key={option} value={option}>
                      {values?.categories.includes(option) ? (
                        <img
                          src={CheckedIcon}
                          alt="Checked"
                          style={{ marginRight: 8 }}
                        />
                      ) : (
                        <img
                          src={UnCheckedIcon}
                          alt="Unchecked"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      {option}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {values.categories && values.categories.includes("Streaming") && (
                <Form.Item
                  hasFeedback={!!errors["streamingCategory"]}
                  validateStatus={errors["streamingCategory"] && "error"}
                  help={errors["streamingCategory"]}
                  className="core-form-item w-full mb-2 block"
                  label="Streaming Category"
                >
                  <Select
                    mode="multiple"
                    showSearch
                    onChange={(value, updatedValue) => {
                      console.log("====== before change ======");
                      console.log("updatedValue", updatedValue);

                      console.log("====== after change ======");
                      values.streamingCategory = updatedValue.map((item) => {
                        var newItem = {};
                        newItem.id = item.key;
                        newItem.name = item.value;
                        newItem.selected = true;
                        return newItem;
                      });
                      console.log(
                        "values.streamingCategory",
                        values.streamingCategory
                      );
                      setFieldValue(
                        "streamingCategory",
                        values.streamingCategory,
                        false
                      );
                      removeError({
                        errors,
                        name: "streamingCategory",
                        setErrors,
                      });
                    }}
                    placeholder="Select categories"
                    value={(values?.streamingCategory ?? streamingCategory)
                      .filter((item) => {
                        return item.selected === true;
                      })
                      .map((item) => item.name)}
                    className="w-full"
                  >
                    {streamingCategory &&
                      streamingCategory.map((item) => (
                        <Select.Option key={item?.id} value={item?.name}>
                          {item?.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              )}
              <Divider orientationMargin="0" orientation="left">
                IKEV2
              </Divider>
              <Form.Item
                hasFeedback={!!errors["ipAddress"]}
                validateStatus={errors["ipAddress"] && "error"}
                help={errors["ipAddress"]}
                className="core-form-item w-full mb-2 block"
                label="ip address"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("ipAddress", value, false);
                    removeError({
                      errors,
                      name: "ipAddress",
                      setErrors,
                    });
                  }}
                  placeholder="IP address"
                  value={values?.ipAddress}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["u_nsm"]}
                validateStatus={errors["u_nsm"] && "error"}
                help={errors["u_nsm"]}
                className="core-form-item w-full mb-2 block"
                label="Username"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("u_nsm", value, false);
                    removeError({
                      errors,
                      name: "u_nsm",
                      setErrors,
                    });
                  }}
                  placeholder="Username"
                  value={values?.u_nsm}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["p_nsm"]}
                validateStatus={errors["p_nsm"] && "error"}
                help={errors["p_nsm"]}
                className="core-form-item w-full mb-2 block"
                label="Password"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("p_nsm", value, false);
                    removeError({
                      errors,
                      name: "p_nsm",
                      setErrors,
                    });
                  }}
                  placeholder="Password"
                  value={values?.p_nsm}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["caFile"]}
                validateStatus={errors["caFile"] && "error"}
                help={errors["caFile"]}
                className="core-form-item w-full mb-4 block"
                label="upload cert file (*.pem)*"
              >
                <div className="flex">
                  <UIButton
                    className="standard"
                    onClick={() => {
                      if (isAllow) {
                        fileSelector = buildFileSelector({
                          errors,
                          setErrors,
                          setFieldValue,
                        });
                        handleFileSelect();
                      }
                    }}
                  >
                    Upload
                  </UIButton>
                  {values?.caFileName && (
                    <div className="ml-3 flex items-center">
                      <div className="text-black pa-13">
                        {values?.caFileName}
                      </div>
                      <img
                        src={CancelIcon}
                        onClick={() => {
                          setFieldValue("caFile", "", false);
                          setFieldValue("caFileName", "", false);
                        }}
                        className="cursor-pointer"
                        alt=""
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                </div>
              </Form.Item>
              <Divider orientationMargin="0" orientation="left">
                Ovpn
              </Divider>
              <Form.Item
                hasFeedback={!!errors["ovpnFile"]}
                validateStatus={errors["ovpnFile"] && "error"}
                help={errors["ovpnFile"]}
                className="core-form-item w-full mb-4 block"
                label="upload OVPN file (*.OVPN)*"
              >
                <div className="flex">
                  <UIButton
                    className="standard"
                    onClick={() => {
                      if (isAllow) {
                        fileSelector = buildFileSelectorOvpn({
                          errors,
                          setErrors,
                          setFieldValue,
                        });
                        handleFileSelect();
                      }
                    }}
                  >
                    Upload
                  </UIButton>

                  {values?.ovpnName && (
                    <div className="ml-3 flex items-center">
                      <div className="text-black pa-13">{values?.ovpnName}</div>
                      <img
                        src={CancelIcon}
                        onClick={() => {
                          setFieldValue("ovpnFile", "", false);
                          setFieldValue("ovpnName", "", false);
                        }}
                        className="cursor-pointer"
                        alt=""
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                </div>
              </Form.Item>
              <Divider orientationMargin="0" orientation="left">
                Wireguard
              </Divider>
              <Form.Item
                hasFeedback={!!errors["publicKey"]}
                validateStatus={errors["publicKey"] && "error"}
                help={errors["publicKey"]}
                className="core-form-item w-full mb-2 block"
                label="PublicKey"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("publicKey", value, false);
                    removeError({
                      errors,
                      name: "publicKey",
                      setErrors,
                    });
                  }}
                  placeholder="PublicKey"
                  value={values?.publicKey}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["presharedKey"]}
                validateStatus={errors["presharedKey"] && "error"}
                help={errors["presharedKey"]}
                className="core-form-item w-full mb-2 block"
                label="PresharedKey"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("presharedKey", value, false);
                    removeError({
                      errors,
                      name: "presharedKey",
                      setErrors,
                    });
                  }}
                  placeholder="PresharedKey"
                  value={values?.presharedKey}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["privateKey"]}
                validateStatus={errors["privateKey"] && "error"}
                help={errors["privateKey"]}
                className="core-form-item w-full mb-2 block"
                label="PrivateKey"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("privateKey", value, false);
                    removeError({
                      errors,
                      name: "privateKey",
                      setErrors,
                    });
                  }}
                  placeholder="PrivateKey"
                  value={values?.privateKey}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["internalAddress"]}
                validateStatus={errors["internalAddress"] && "error"}
                help={errors["internalAddress"]}
                className="core-form-item w-full mb-2 block"
                label="InternalAddress"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("internalAddress", value, false);
                    removeError({
                      errors,
                      name: "internalAddress",
                      setErrors,
                    });
                  }}
                  placeholder="InternalAddress"
                  value={values?.internalAddress}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["port"]}
                validateStatus={errors["port"] && "error"}
                help={errors["port"]}
                className="core-form-item w-full mb-2 block"
                label="Port"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("port", value, false);
                    removeError({
                      errors,
                      name: "port",
                      setErrors,
                    });
                  }}
                  placeholder="Port"
                  value={values?.port}
                  className="w-full"
                />
              </Form.Item>

              <Divider orientationMargin="0" orientation="left">
                Proxy
              </Divider>
              <Form.Item
                hasFeedback={!!errors["proxyPort"]}
                validateStatus={errors["proxyPort"] && "error"}
                help={errors["proxyPort"]}
                className="core-form-item w-full mb-2 block"
                label="ProxyPort"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("proxyPort", value, false);
                    removeError({
                      errors,
                      name: "proxyPort",
                      setErrors,
                    });
                  }}
                  placeholder="ProxyPort"
                  value={values?.proxyPort}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["proxyUsername"]}
                validateStatus={errors["proxyUsername"] && "error"}
                help={errors["proxyUsername"]}
                className="core-form-item w-full mb-2 block"
                label="ProxyUsername"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("proxyUsername", value, false);
                    removeError({
                      errors,
                      name: "proxyUsername",
                      setErrors,
                    });
                  }}
                  placeholder="proxyUsername"
                  value={values?.proxyUsername}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                hasFeedback={!!errors["proxyPassword"]}
                validateStatus={errors["proxyPassword"] && "error"}
                help={errors["proxyPassword"]}
                className="core-form-item w-full mb-2 block"
                label="ProxyPassword"
              >
                <Input
                  onChange={({ target: { value } }) => {
                    setFieldValue("proxyPassword", value, false);
                    removeError({
                      errors,
                      name: "proxyPassword",
                      setErrors,
                    });
                  }}
                  placeholder="proxyPassword"
                  value={values?.proxyPassword}
                  className="w-full"
                />
              </Form.Item>

              <div className="flex justify-end pt-4 border-0 border-t border-solid border-gray-200">
                <UIButton onClick={onCloseServe} className="ghost border mr-4">
                  Cancel
                </UIButton>
                {isAllow && (
                  <UIButton htmlType="submit" className="third">
                    Save
                  </UIButton>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </UICPopup>
  );
};
