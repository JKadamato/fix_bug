import { Form, Input, notification, Select } from "antd";
import UICPopup from "@app/components/core/popup/cpopup";
import React from "react";
import * as Yup from "yup";
import CurrencyFormat from "react-currency-format";
import { Formik } from "formik";
import UIButton from "@app/components/core/button";
import { removeError } from "@app/utils";
import { POST, PUT } from "@app/request";

export const DiscountDetail = ({ onClose, cb, data = undefined, user }) => {
  const [formData, setFormData] = React.useState({
    fromDate: undefined,
    toDate: undefined,
    duration: undefined,
    pricing: undefined,
    discount: undefined,
    purchaseId: undefined,
  });

  const validateSchema = Yup.object({
    packagePricing: Yup.number().required("Please input pricing"),
    packageId: Yup.string().required("Please input purchase id"),
    discount: Yup.string().required("Please input package name"),
    packageDuration: Yup.string().required("Please choose duration"),
  });

  React.useEffect(() => {
    if (data) {
      setFormData({
        discount: data?.discount,
        packagePricing: data?.packagePricing,
        packageDuration: data?.packageDuration,
        packagePlatform: data?.packagePlatform,
        packageId: data?.packageId,
      });
    }
  }, []);

  const update = (form) => {
    PUT(`admin/promotion/updatePromotion`, {
      ...form,
      adminId: user?.id,
    })
      .then((data) => {
        notification.info({
          description: `Discount was updated successfully`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification info",
        });
        onClose();
        cb();
      })
      .catch((err) => {
        notification.info({
          description: `Discount was updated failure`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification error",
        });
      });
  };

  return (
    <UICPopup
      hiddenFooter={true}
      onCancel={onClose}
      textCancel="Cancel"
      textOk="Save"
      title={"Save This Change"}
      width={416}
    >
      <Formik
        onSubmit={(e) => {
          update(e);
        }}
        validationSchema={validateSchema}
        initialValues={formData}
        enableReinitialize
      >
        {({ setErrors, setFieldValue, errors, values, handleSubmit }) => {
          return (
            <Form onFinish={handleSubmit} className="block w-full">
              <div>
                <div>
                  Are you sure to save this change? This information will be
                  updated immediately on the system
                </div>
                <div className="flex justify-end pt-4">
                  <UIButton onClick={onClose} className="ghost border mr-4">
                    Cancel
                  </UIButton>
                  <UIButton htmlType="submit" className="third">
                    Save
                  </UIButton>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </UICPopup>
  );
};
