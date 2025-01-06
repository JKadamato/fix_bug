import Layout from "@app/components/layout";
import React, { useEffect, useState } from "react";
import UIButton from "@app/components/core/button";
import UITable from "@app/components/core/table";
import { Select, Switch, DatePicker, notification, Form, Input } from "antd";
import { EMAIL } from "@app/configs";
import { connect } from "react-redux";
import css from "styled-jsx/css";
import { POST, PUT } from "@app/request";
import * as Yup from "yup";
import { Formik, useFormik } from "formik";
import moment from "moment";
import { withRouter } from "react-router";
import { DiscountDetail } from "@app/modules/discount/components/detail";

const runFunction = (cb) => cb();

const styles = css.global`
  table {
    border: 1px solid #e0e0e0;
    border-collapse: collapse;
    width: 100%;
  }
  th,
  td {
    width: 20%;
    border: 1px solid #e0e0e0;
  }
  td {
    padding: 8px;
  }
  span {
    text-transform: uppercase;
    font-weight: 300;
    letter-spacing: 2px;
    font-size: 8px;
  }
  .card {
    width: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 0.25rem;
    font-size: 13px;
    text-align: center;
    background-color: #f5f5f5;
  }
  .shdvn-table .ant-table-cell {
    text-transform: lowercase;
  }
  .ant-select-selection-item {
    letter-spacing: normal;
    text-transform: none;
    font-size: 14px;
  }
  input {
    text-align: center;
  }
  p {
    color: red;
  }
`;
const Discount = ({
  global: { user },
  data,
  onClose = undefined,
  ...props
}) => {
  const fields = {
    email: "email",
  };
  const [error, setError] = React.useState("");
  const [info, setInfo] = React.useState({});
  const [success, setSuccess] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [isPageLoading, setPageLoading] = React.useState(true);
  const [isPageLoading2, setPageLoading2] = React.useState(false);
  const [initialValues, setInitialValues] = React.useState({
    [fields.email]: "",
  });

  const [filter, setFilter] = React.useState({
    platform: "",
  });
  const [isReloadTable, setReloadTable] = React.useState("");
  const [showAddPack, setShowAddPack] = React.useState({
    status: false,
    data: undefined,
  });
  const isAllow = user?.email && user?.email?.toLowerCase() !== EMAIL;

  const onHandleSubmit = async (formValues) => {
    setLoading(true);
    createAdminUser(formValues);
  };

  const [formData, setFormData] = React.useState({
    duration: "",
    pricing: "",
    discount: "",
    packageId: "",
  });

  React.useEffect(() => {
    if (data) {
      setFormData({
        duration: data?.duration,
        pricing: data?.pricing,
        discount: data?.discount,
        packageId: data?.packageId,
      });
    }
  }, []);

  const validateSchema = Yup.object({
    pricing: Yup.string().required("Please input ip address"),
    discount: Yup.string().required("Please input username"),
    packageId: Yup.string().required("Please input password"),
    duration: Yup.array()
      .of(
        Yup.string().oneOf(
          ["1 month", "6 months", "12 months"],
          "Invalid category",
        ),
      )
      .min(1, "Please select at least one category")
      .required("Please select categories"),
  });

  // React.useEffect(() => {
  //   const {
  //     match: {
  //       params: { id, type },
  //     },
  //   } = props;

  //   if (id && type && user?.email && user?.email?.toLowerCase() !== EMAIL) {
  //     POST("/admin/promotion/updatePromotion", {
  //       adminId: user?.id,
  //       fromDate: user?.fromDate,
  //       toDate: user?.toDate,
  //       promotions: user?.promotions,
  //     })
  //       .then(({ data }) => {
  //         const tmp = data?.data || {};
  //         setInfo({
  //           ...tmp,
  //           ...update,
  //           fromDate: update?.fromDate,
  //           toDate: update?.toDate,
  //           promotions: update?.promotions,
  //         });
  //         console.log("DETAIL", update);
  //         console.log("DATA", data);
  //         setInitialValues({
  //           ...initialValues,
  //           email: tmp?.email || data?.id || "",
  //         });
  //         setPageLoading(false);
  //         setfromDate(tmp?.fromDate || null);
  //         settoDate(tmp?.toDate || null);
  //       })
  //       .catch(() => {
  //         history.push("/discount");
  //       });
  //     // firestore.collection(type).doc(id).get()
  //   }
  // }, []);

  const [fromDate, setfromDate] = React.useState(null);
  const [toDate, settoDate] = React.useState(false);

  // const [update, setUpdate] = React.useState({
  //   fromDate: "",
  //   toDate: "",
  //   packageId: "",
  //   discount: "",
  //   duration: "",
  //   pricing: "",
  //   promotions: [],
  // });
  const [update, setUpdate] = React.useState([]);

  // const onUpdatePromotion = (data) => {
  //   const {
  //     match: {
  //       params: { id },
  //     },
  //   } = props;

  //   console.log("Sending data to API:", data);
  //   PUT(`/admin/promotion/updatePromotion`, {
  //     ...data,
  //     adminId: user?.id,
  //     promotions: [
  //       {
  //         fromDate: "2023-08-03T19:29:16.787Z",
  //         toDate: "2023-12-31T19:29:16.787Z",
  //         createdAt: "2023-11-09T07:51:38.869Z",
  //         _id: "654c8fa211c6a94d0647512e",
  //         packageId: "app.witwork.vpn.ios.gold_monthly_updates",
  //         discount: 40,
  //         platform: "apple",
  //         __v: 0,
  //         duration: "1 month",
  //         pricing: "20",
  //         id: "654c8fa211c6a94d0647512e",
  //       },
  //       {
  //         fromDate: "2023-08-03T19:29:16.787Z",
  //         toDate: "2023-12-31T19:29:16.787Z",
  //         createdAt: "2023-11-09T07:51:38.869Z",
  //         _id: "654c8fa211c6a94d0647512f",
  //         packageId: "app.witwork.vpn.ios.gold_monthly",
  //         discount: 30,
  //         platform: "apple",
  //         __v: 0,
  //         id: "654c8fa211c6a94d0647512f",
  //       },
  //       {
  //         fromDate: "2023-08-03T19:29:16.787Z",
  //         toDate: "2023-12-31T19:29:16.787Z",
  //         createdAt: "2023-11-09T07:51:38.869Z",
  //         _id: "654c8fa211c6a94d06475130",
  //         packageId: "promo.vpnrice.1month",
  //         discount: 40,
  //         platform: "google",
  //         __v: 0,
  //         id: "654c8fa211c6a94d06475130",
  //       },
  //       {
  //         fromDate: "2023-08-03T19:29:16.787Z",
  //         toDate: "2023-12-31T19:29:16.787Z",
  //         createdAt: "2023-11-09T07:51:38.869Z",
  //         _id: "654c8fa211c6a94d06475131",
  //         packageId: "promo.vpnrice.6months",
  //         discount: 60,
  //         platform: "google",
  //         __v: 0,
  //         id: "654c8fa211c6a94d06475131",
  //       },
  //       {
  //         fromDate: "2023-08-03T19:29:16.787Z",
  //         toDate: "2023-12-31T19:29:16.787Z",
  //         createdAt: "2023-11-09T07:51:38.869Z",
  //         _id: "654cf7aceefbf8327b679ed2",
  //         packageId: "promo.vpnrice.12months",
  //         discount: 75,
  //         platform: "google",
  //         __v: 0,
  //         id: "654cf7aceefbf8327b679ed2",
  //       },
  //     ],
  //   })
  //     .then((response) => {
  //       notification.info({
  //         description: `Discount was updated successfully`,
  //         placement: "bottomRight",
  //         duration: 2,
  //         icon: "",
  //         className: "core-notification info",
  //       });
  //       if (response.ok) {
  //         return response.json();
  //       } else {
  //         throw new Error("Request failed.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Request failed:", error);
  //     });
  // };

  const [changeValue, setChangeValue] = React.useState({
    id: undefined,
    value: undefined,
  });

  const onUpdatePromotion = (form = {}, filterPlatform) => {
    if (changeValue?.id || Object.values(form).length > 0) {
      let promotions = form.promotions || [];

      if (filterPlatform) {
        promotions = promotions.filter(
          (promo) => promo.platform === filterPlatform,
        );
      }

      PUT(`/admin/promotion/updatePromotion`, {
        adminId: user?.id,
        promotions: [
          {
            fromDate: "2023-08-03T19:29:16.787Z",
            toDate: "2023-12-31T19:29:16.787Z",
            createdAt: "2023-11-09T07:51:38.869Z",
            _id: "654c8fa211c6a94d0647512e",
            packageId: "app.witwork.vpn.ios.gold_monthly_updates",
            discount: 40,
            platform: "apple",
            __v: 0,
            duration: "1 month",
            pricing: "20",
            id: "654c8fa211c6a94d0647512e",
          },
          {
            fromDate: "2023-08-03T19:29:16.787Z",
            toDate: "2023-12-31T19:29:16.787Z",
            createdAt: "2023-11-09T07:51:38.869Z",
            _id: "654c8fa211c6a94d0647512f",
            packageId: "app.witwork.vpn.ios.gold_monthly",
            discount: 30,
            platform: "apple",
            __v: 0,
            id: "654c8fa211c6a94d0647512f",
          },
          {
            fromDate: "2023-08-03T19:29:16.787Z",
            toDate: "2023-12-31T19:29:16.787Z",
            createdAt: "2023-11-09T07:51:38.869Z",
            _id: "654c8fa211c6a94d06475130",
            packageId: "promo.vpnrice.1month",
            discount: 40,
            platform: "google",
            __v: 0,
            id: "654c8fa211c6a94d06475130",
          },
          {
            fromDate: "2023-08-03T19:29:16.787Z",
            toDate: "2023-12-31T19:29:16.787Z",
            createdAt: "2023-11-09T07:51:38.869Z",
            _id: "654c8fa211c6a94d06475131",
            packageId: "promo.vpnrice.6months",
            discount: 60,
            platform: "google",
            __v: 0,
            id: "654c8fa211c6a94d06475131",
          },
          {
            fromDate: "2023-08-03T19:29:16.787Z",
            toDate: "2023-12-31T19:29:16.787Z",
            createdAt: "2023-11-09T07:51:38.869Z",
            _id: "654cf7aceefbf8327b679ed2",
            packageId: "promo.vpnrice.12months",
            discount: 75,
            platform: "google",
            __v: 0,
            id: "654cf7aceefbf8327b679ed2",
          },
        ],
      })
        .then((result) => {
          notification.info({
            description: `Promotion was updated successfully`,
            placement: "bottomRight",
            duration: 2,
            icon: "",
            className: "core-notification info",
          });
          setChangeValue({
            id: undefined,
            value: undefined,
          });
          setReloadTable(new Date().getTime().toString());
        })
        .catch((err) => {
          console.log(err);
          notification.info({
            description: `Promotion was updated failure`,
            placement: "bottomRight",
            duration: 2,
            icon: "",
            className: "core-notification error",
          });
        });
    }
  };

  // function handleUpdate() {
  //   onUpdatePromotion(update);
  // }

  React.useEffect(() => {
    const storedFromDate = localStorage.getItem("fromDate");
    if (storedFromDate) {
      setfromDate(storedFromDate);
    }

    const storedToDate = localStorage.getItem("toDate");
    if (storedToDate) {
      settoDate(JSON.parse(storedToDate));
    }

    setPageLoading(false);
  }, []);

  function onChangeFromDate(date, dateString) {
    console.log(date, dateString);
    setUpdate({
      ...update,
      fromDate: dateString,
    });
    setfromDate(dateString);
  }
  function onChangeToDate(date, dateString) {
    console.log(date, dateString);
    setUpdate({
      ...update,
      toDate: dateString,
    });
    settoDate(dateString);
  }
  const [showPopup, setShowPopup] = useState(false);
  const handleUpdatePopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <Layout>
      <div className="bg-white">
        <div className="flex">
          <table>
            <tr>
              <td rowSpan={6} style={{ width: "5%" }}>
                <div className="font-bold">
                  <Switch className="mr-2" />
                  Sale off Screen
                </div>
                <div className="my-2">
                  When turn on this screen, the discount price will be activated
                </div>
                <div className="flex flex-col">
                  <span>start time</span>
                  <DatePicker
                    onChange={onChangeFromDate}
                    value={fromDate ? moment(fromDate) : null}
                  ></DatePicker>
                </div>
                <div className="flex flex-col">
                  <span>end time</span>
                  <DatePicker
                    onChange={onChangeToDate}
                    value={toDate ? moment(toDate) : null}
                  ></DatePicker>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={4}>
                <div className="flex items-center">
                  <div className="mr-3 pa-13 font-bold text-black">
                    Filter by:
                  </div>
                  <Select
                    value={filter?.platform}
                    onChange={(e) => setFilter({ ...filter, platform: e })}
                    placeholder="All platform"
                    style={{ width: 123 }}
                  >
                    {/* <Select.Option value={""}>All platform</Select.Option> */}
                    <Select.Option value={"google"}>Google</Select.Option>
                    <Select.Option value={"apple"}>iOS</Select.Option>
                  </Select>
                </div>
              </td>
            </tr>

            <UITable
              customComp={{
                duration: ({ text, row }) => (
                  <div>
                    <Select className="w-full" name="duration">
                      <Select.Option value="1 month">1 month</Select.Option>
                      <Select.Option value="6 months">6 months</Select.Option>
                      <Select.Option value="12 months">12 months</Select.Option>
                    </Select>
                  </div>
                ),
                pricing: ({ text, row }) => (
                  <div>
                    <input
                      onChange={({ target: { value } }) => {
                        runFunction(() => {
                          setChangeValue({
                            value: row?.pricing,
                            id: row?.id,
                            form: row,
                          });
                        });
                      }}
                      value={
                        changeValue?.id === row?.id ? changeValue?.value : text
                      }
                      name="pricing"
                      placeholder="Pricing"
                      className="w-full outline-none px-2 py-1"
                    />
                  </div>
                ),
                discount: ({ text, row }) => (
                  <div>
                    <input
                      onChange={({ target: { value } }) => {
                        runFunction(() => {
                          setChangeValue({
                            value,
                            id: row?.id,
                            form: row,
                          });
                        });
                      }}
                      value={
                        changeValue?.id === row?.id ? changeValue?.value : text
                      }
                      name="discount"
                      placeholder="Discount"
                      className="w-full outline-none px-2 py-1"
                    />
                  </div>
                ),
                purchaseId: ({ text, row }) => (
                  <div>
                    <input
                      onChange={({ target: { value } }) => {
                        runFunction(() => {
                          setChangeValue({
                            value,
                            id: row?.id,
                            form: row,
                          });
                        });
                      }}
                      value={
                        changeValue?.id === row?.id ? changeValue?.value : text
                      }
                      name="purchaseId"
                      placeholder="Purchase ID"
                      className="w-full outline-none px-2 py-1"
                    />
                  </div>
                ),
              }}
              service={`admin/promotion/getPromotion`}
              isHiddenPg={false}
              defineCols={[
                {
                  name: () => <div className="text-center">duration</div>,
                  code: "duration",
                  sort: 1,
                },
                {
                  name: () => <div className="text-center">pricing</div>,
                  code: "pricing",
                  sort: 2,
                },
                {
                  name: () => <div className="text-center">Discount</div>,
                  code: "discount",
                  sort: 3,
                },
                {
                  name: () => <div className="text-center">Purchase ID</div>,
                  code: "packageId",
                  sort: "end",
                },
              ]}
              payload={{
                adminId: user?.id,
              }}
              queries={filter}
              headerWidth={{}}
              columns={[]}
              isReload={isReloadTable}
            />
          </table>
        </div>
      </div>
      <div
        className="absolute bottom-0 right-0 w-full bg-white"
        style={{ padding: "16px 74px", border: "1px solid #E0E0E0" }}
      >
        {/* {changeValue?.id && ( */}
        <div className="flex justify-end">
          <UIButton
            className="ghost border mr-4"
            // onClick={() => {}}
            onClick={() => {
              setChangeValue({
                id: undefined,
                value: undefined,
              });
              setReloadTable(new Date().getTime().toString());
            }}
          >
            Cancel
          </UIButton>
          <UIButton
            className="third"
            // onClick={handleUpdate}
            onClick={() => onUpdatePromotion()}
            htmlType="submit"
          >
            Save
          </UIButton>
        </div>
        {/* )} */}
        {showPopup && <DiscountDetail onClose={closePopup} />}
      </div>
      <style jsx>{styles}</style>
    </Layout>
  );
};
export default connect((state) => state)(withRouter(Discount));
