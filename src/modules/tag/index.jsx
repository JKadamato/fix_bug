import Layout from "@app/components/layout";
import React, { useState, useEffect } from "react";
import UIButton from "@app/components/core/button";
import UITable from "@app/components/core/table";
import {
  Dropdown,
  Input,
  Menu,
  Select,
  Table,
  Modal,
  notification,
} from "antd";
import TrashIcon from "@app/resources/images/trash.svg";
import { EMAIL } from "@app/configs";
import { connect } from "react-redux";
import css from "styled-jsx/css";
import YoutubeIcon from "@app/resources/images/youtube_icon.svg";
import GamingIcon from "@app/resources/images/game_icon.svg";
import SelectedIcon from "@app/resources/images/selected_icon.svg";
import ConnectIcon from "@app/resources/images/connect_icon.svg";
import NetflixIcon from "@app/resources/images/netflix_icon.svg";
import P2pIcon from "@app/resources/images/p2p_icon.svg";
import PrimeVideoIcon from "@app/resources/images/prime_video_icon.svg";
import YoutubeColorIcon from "@app/resources/images/youtube_icon_color.svg";
import AddIcon from "@app/resources/images/add_icon.svg";
import { Table as Table2 } from "antd";
import { withRouter } from "react-router";
import { getBase64 } from "@app/utils";
import { POST, DELETE } from "@app/request";

const defaultNewTag = "newTag";

const styles = css.global`
  img {
    width: 24px;
    height: 24px;
  }
  .ant-btn[disabled],
  .ant-btn[disabled]:hover {
    background: gray;
  }
  .trash-icon {
    min-width: 24px !important;
    background: none !important;
    padding-right: 0 !important;
  }
  .shdvn-table .ant-table-tbody > tr > td {
    text-align: left;
  }
`;
const runFunction = (cb) => cb();

const Tag = ({ global: { user } }) => {
  const [base64Data, setBase64Data] = useState();

  // Image Base64 UnSelected Icon
  const onChangeImgBase64 = (e, rowKey) => {
    // console.log("File uploaded unselected icon: ", e.target.files);

    if (e.target.files.length === 0) {
      console.log("No file selected.");
      return;
    }

    const file = e.target.files[0];
    const data = new FileReader();

    data.onload = () => {
      // console.log("Base64 Data unselected icon: ", data.result);

      const updatedTableData = tableData.map((item) => {
        if (item.key === rowKey) {
          return { ...item, base64Image: data.result };
        }
        return item;
      });

      setTableData(updatedTableData);
    };

    data.onerror = (error) => {
      console.error("Error reading file: ", error);
    };

    data.readAsDataURL(file);
  };

  // Image Base64 Selected Icon
  const onChangeImgBase64SelectedIcon = (e, rowKey) => {
    // console.log("File uploaded selected icon: ", e.target.files);

    if (e.target.files.length === 0) {
      console.log("No file selected.");
      return;
    }

    const file = e.target.files[0];
    const data = new FileReader();

    data.onload = () => {
      // console.log("Base64 Data selected icon: ", data.result);

      const updatedTableData = tableData.map((item) => {
        if (item.key === rowKey) {
          return { ...item, base64ImageSelectedIcon: data.result };
        }
        return item;
      });

      setTableData(updatedTableData);
    };

    data.onerror = (error) => {
      console.error("Error reading file: ", error);
    };

    data.readAsDataURL(file);
  };

  const [isSaveCancelEnabled, setSaveCancelEnabled] = useState(false);
  const [editedValues, setEditedValues] = useState({});

  const handleEdit = (key) => {
    setSaveCancelEnabled(true);

    const fileInput = document.getElementById(`fileInput_${key}`);

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        getBase64(file, (base64Data) => {
          setEditedValues({ ...editedValues, [key]: base64Data });
        });
      }
    });
    fileInput.click();
  };

  const handleCancel = () => {
    // Disable Save and Cancel buttons when Cancel is clicked
    setSaveCancelEnabled(false);
  };

  const handleSave = () => {
    // Perform save action and disable Save and Cancel buttons
    setSaveCancelEnabled(false);
  };

  const handleInputChange = (e, key) => {
    const newData = tableData.map((item) => {
      if (item.key === key) {
        return { ...item, tagName: e.target.value };
      }
      return item;
    });
    setTableData(newData);
    setSaveCancelEnabled(true); // Enable Save and Cancel buttons
  };

  const handleSelectChange = (e, key) => {
    const newData = tableData.map((item) => {
      if (item.key === key) {
        return { ...item, parentTag: e };
      }
      return item;
    });
    setTableData(newData);
    setSaveCancelEnabled(true);
  };

  const columns = [
    {
      title: "Tag Name",
      dataIndex: "tagName",
      key: "name",
      width: 734,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key)}
          placeholder="Tag Name"
        />
      ),
    },
    {
      title: "Parent Tag",
      dataIndex: "parentTag",
      key: "parentTag",
      width: 214,
      render: (text, record) => (
        <Select
          className="w-full"
          name="parentTag"
          onChange={(e) => handleSelectChange(e, record.key)}
          value={text}
        >
          <Select.Option value="">None</Select.Option>
          <Select.Option value="streaming">Streaming</Select.Option>
          <Select.Option value="gaming">Gaming</Select.Option>
          <Select.Option value="connection">Connection</Select.Option>
        </Select>
      ),
    },
    {
      // iconSrcUnselect: apiImage + row.unselectedIcon,
      // iconSrc: apiImage + row.selectedIcon,
      title: "UnSelect Icon",
      dataIndex: "unSelectIcon",
      key: "unSelectIcon",
      width: 124,
      render: (text, record) => (
        <div className="flex justify-between items-center py-2 pr-4">
          <input
            type="file"
            onChange={(e) => onChangeImgBase64(e, record.key)}
          />{" "}
          <img src={record.base64Image || record.iconSrcUnselect} alt="Icon" />{" "}
        </div>
      ),
    },
    {
      title: "Selected Icon",
      dataIndex: "selectedIcon",
      key: "selectedIcon",
      width: 124,
      render: (text, record) => (
        <div className="flex justify-between items-center py-2 pr-4">
          <input
            type="file"
            onChange={(e) => onChangeImgBase64SelectedIcon(e, record.key)}
          />{" "}
          <img
            src={record.base64ImageSelectedIcon || record.iconSrc}
            alt="Icon"
          />{" "}
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      width: 100,
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <UIButton className="trash-icon">
            <img
              src={TrashIcon}
              alt="Delete"
              onClick={() => removeTag(record.key)}
            />
          </UIButton>
        </div>
      ),
    },
  ];

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagName, setTagName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState();
  const [unselectedIcon, setUnSelectedIcon] = useState("");

  const addNewRow = () => {
    const newRow = {
      key: "newKey-123",
      tagName: "",
      parentTag: "",
      base64Image: "" /* other fields */,
    };
    setTableData([...tableData, newRow]);
  };

  // CALL API GET LIST TAG
  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminId: user?.id,
          }),
        };

        const apiUrl = `${process.env.API}/admin/tag/get`;

        const response = await fetch(apiUrl, requestOptions);
        const result = await response.json();

        if (result.success === 1) {
          const transformedData = result.data.rows.map((row) => ({
            key: row.id,
            tagName: row.name,
            parentTag: row.categories.join(", "),
            iconSrcUnselect: apiImage + row.unselectedIcon,
            iconSrc: apiImage + row.selectedIcon,
          }));
          setTableData(transformedData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // functions to handle the image uploads and convert them to base64
  const handleImageChange = (e, setImageState) => {
    const file = e.target.files[0];
    if (file) {
      getBase64(file, (base64Data) => {
        setImageState(base64Data); // Update the state with the Base64 string
      });
    } else {
      console.error("No file selected");
    }
  };

  // Assuming getBase64 is a function that converts a file to a Base64 string and returns a promise
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // CALL API CREATE TAG
  const handleSaveApi = async () => {
    try {
      // console.log("tabledata", tableData);
      for (let [i, item] of tableData.entries()) {
        const { tagName, base64Image, iconSrc } = item;

        if (!base64Image) continue;
        let k = base64Image.indexOf("base64") + 7;
        let n = base64Image.length;
        // console.log(`${i}.iconSrc`, base64Image);
        let unselectedIcon = base64Image.substr(k, n);

        const dataToSend = {
          adminId: user?.id,
          name: tagName,
          selectedIcon: unselectedIcon,
          unselectedIcon,
        };

        // console.log("Sending data to API:", dataToSend);

        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        };

        const apiUrl = `${process.env.API}/admin/tag/create`;
        const response = await fetch(apiUrl, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success === 1) {
          console.log("Tag created successfully:", result);
        } else {
          console.error("Failed to create tag:", result.message);
        }
      }
    } catch (error) {
      console.error("Error making save request:", error);
    }
  };

  // CALL API DELETE TAG
  const removeTag = async (tagId) => {
    if (tagId.startsWith(defaultNewTag)) {
      setTableData((prevData) => prevData.filter((tag) => tag.key !== tagId));
    } else {
      setLoading(true); // Assuming you have a setLoading function to handle UI loading state
      try {
        const requestOptions = {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminId: user?.id,
            id: tagId,
          }),
        };

        const apiUrl = `${process.env.API}/admin/tag/delete`;
        const response = await fetch(apiUrl, requestOptions);
        const result = await response.json();

        if (result.success === 1) {
          setTableData((prevData) =>
            prevData.filter((tag) => tag.key !== tagId),
          );
          notification.success({
            message: "Success",
            description: "Tag deleted successfully!",
            placement: "bottomRight",
            duration: 2,
            className: "core-notification info",
          });
        } else {
          notification.error({
            message: "Error",
            description: "Failed to delete the tag.",
            placement: "bottomRight",
            duration: 2,
            className: "core-notification error",
          });
        }
      } catch (error) {
        console.error("Error in deleting tag:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewTag = () => {
    const newTag = {
      key: defaultNewTag + (tableData.length + 1).toString(),
      tagName: "",
      parentTag: "None",
      iconSrcUnselect: AddIcon,
      iconSrc: AddIcon,
    };
    setTableData([...tableData, newTag]);
  };

  const [changeValue, setChangeValue] = React.useState({
    id: undefined,
    value: undefined,
  });

  const apiImage = process.env.PUBLIC_IMAGES_URL;

  return (
    <Layout title="Tag">
      <div>
        <Table2
          className="shdvn-table"
          columns={columns}
          dataSource={tableData}
          bordered
          loading={loading}
          title={() => (
            <div className="flex justify-end">
              <UIButton
                htmlType="button"
                className="third"
                onClick={handleNewTag}
              >
                new tag
              </UIButton>
            </div>
          )}
        />
      </div>

      <div
        className="absolute bottom-0 right-0 w-full bg-white"
        style={{ padding: "16px 74px", border: "1px solid #E0E0E0" }}
      >
        <div className="flex justify-end">
          <div>
            <UIButton
              onClick={handleCancel}
              disabled={!isSaveCancelEnabled}
              className={
                isSaveCancelEnabled ? "bg-black text-white mr-2" : "mr-2"
              }
            >
              Cancel
            </UIButton>
            <UIButton
              onClick={handleSaveApi}
              disabled={!isSaveCancelEnabled}
              className={isSaveCancelEnabled ? "third" : ""}
            >
              Save
            </UIButton>
          </div>
        </div>
      </div>
      <style jsx>{styles}</style>
    </Layout>
  );
};
export default connect((state) => state)(withRouter(Tag));
