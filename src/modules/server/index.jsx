import Layout from "@app/components/layout";
import React from "react";
import UISearch from "@app/components/core/input/search";
import { Checkbox, Dropdown, Menu, Modal, notification, Select } from "antd";
import UIButton from "@app/components/core/button";
import { PremiumServer } from "@app/modules/server/components/detail";
import UITable from "@app/components/core/table";
import Tag from "@app/components/core/tag";

import MoreIcon from "@app/resources/images/more.svg";
import { delay } from "@app/utils";
import { EMAIL } from "@app/configs";
import { connect } from "react-redux";
import { POST } from "@app/request";

const Server = ({ global: { user } }) => {
  const [filter, setFilter] = React.useState({});
  const [searchValue, setSearch] = React.useState({
    search_by: "country",
    search: "",
  });
  const [isShowAddServer, setShowAddServe] = React.useState({
    type: "",
    data: undefined,
  });
  const [isReloadTable, setReloadTable] = React.useState("");
  const showModalAddNewServer = (type = "PREMIUM", data = undefined) =>
    setShowAddServe({ type, data });

  const onCloseAddServe = () => setShowAddServe("");

  const remove = (row) => {
    POST("/admin/server/delete", { id: row?.id, adminId: user?.id })
      .then(() => {
        notification.info({
          description: `${row?.country} server was deleted successfully`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification info",
        });
        setReloadTable(new Date().getTime().toString());
      })
      .catch((err) => {
        notification.info({
          description: `${row?.country} server was deleted failure`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification error",
        });
      });
  };

  const search = (value) => {
    if (value === "") {
      delay(() => {
        setReloadTable(new Date().getTime().toString());
        setSearch({
          ...searchValue,
          search: "",
        });
      }, 300);
    } else {
      delay(() => {
        setSearch({
          ...searchValue,
          search: value,
        });
      }, 300);
    }
  };

  // const handleCategoryChange = (newCategory, row) => {
  //   // Your code to save newCategory for the specific row.
  //   // This might involve making an API call to save the new category in your database.
  //   // Example:
  //   POST("/admin/updateServerCategory", { serverId: row.id, newCategory })
  //     .then(() => {
  //       // Possibly update the local state to reflect the change or refetch the server data.
  //       notification.info({
  //         description: `Category for ${row?.country} server was updated successfully`,
  //         placement: "bottomRight",
  //         duration: 2,
  //       });
  //       // Trigger reload of table data or update state as needed.
  //     })
  //     .catch((err) => {
  //       notification.error({
  //         description: `Failed to update category for ${row?.country} server`,
  //         placement: "bottomRight",
  //         duration: 2,
  //       });
  //     });
  // };

  return (
    <Layout title="Server" description="desc of server">
      <div className="core-card">
        <div className="flex justify-between">
          <div className="flex">
            <UISearch
              onChange={({ target: { value } }) => search(value)}
              placeholder="Search Server Name"
            />
            <div className="flex ml-10 items-center">
              <div className="mr-3 pa-13 font-bold text-black">Filter by:</div>
              <Select
                value={filter?.status}
                onChange={(e) => setFilter({ ...filter, status: e })}
                placeholder="All Status"
                style={{ width: 123 }}
              >
                <Select.Option value="">All Status</Select.Option>
                <Select.Option value={true}>Enable</Select.Option>
                <Select.Option value={false}>Disable</Select.Option>
              </Select>
              <Select
                value={filter?.premium}
                onChange={(e) => setFilter({ ...filter, premium: e })}
                placeholder="Premium & Free"
                className="ml-3"
                style={{ width: 155 }}
              >
                <Select.Option value="">Premium & Free</Select.Option>
                <Select.Option value={true}>Premium</Select.Option>
                <Select.Option value={false}>Free</Select.Option>
              </Select>
              <Select
                value={filter?.categories}
                onChange={(e) => setFilter({ ...filter, categories: e })}
                placeholder="Category"
                className="ml-3"
                style={{ width: 155 }}
              >
                <Select.Option value="">Category</Select.Option>
                <Select.Option value="Streaming">Streaming</Select.Option>
                <Select.Option value="Gaming">Gaming</Select.Option>
                <Select.Option value="Connection">Connection</Select.Option>
              </Select>
            </div>
          </div>
          <div className="flex">
            <UIButton
              className="secondary mr-3"
              onClick={() => showModalAddNewServer("PREMIUM")}
            >
              New premium server
            </UIButton>
            <UIButton
              className="third"
              onClick={() => showModalAddNewServer("FREE")}
            >
              New free server
            </UIButton>
          </div>
        </div>

        <div className="mt-6">
          <UITable
            isAddParams={false}
            onSelectAll={(e) => console.log(e)}
            customComp={{
              status: ({ text }) => (
                <Tag
                  className="uppercase"
                  type={Boolean(text) ? "primary" : "second"}
                >
                  {Boolean(text) ? "Enable" : "Disabled"}
                </Tag>
              ),
              premium: ({ text }) => (
                <Tag
                  className="uppercase"
                  type={Boolean(text) ? "primary" : "second"}
                >
                  {Boolean(text) ? "Premium" : "Free"}
                </Tag>
              ),
              recommend: ({ text }) => (
                <div className="text-black pa-13 capitalize text-center">
                  {Boolean(text) ? "True" : "False"}
                  {/* <Select
                    defaultValue={text}
                    style={{ width: 120 }}
                    onChange={(newValue) => handleCategoryChange(newValue, row)}
                  >
                    <Select.Option value="Streaming">Streaming</Select.Option>
                    <Select.Option value="Gaming">Gaming</Select.Option>
                    <Select.Option value="Connection">Connection</Select.Option>
                  </Select> */}
                </div>
              ),
              categories: ({ text }) => (
                <div className="text-black pa-13 capitalize text-center">
                  {text.join(", ") || "N/A"}
                </div>
              ),

              country: ({ text, row: { countryCode } }) => (
                <div className="text-left flex items-center">
                  <img
                    className="rounded-full mr-2"
                    style={{ border: "2px solid #f5f5f5" }}
                    src={`/flags/${countryCode.toLowerCase()}.svg`}
                    width={24}
                    height={24}
                  />
                  <span>{text}</span>
                </div>
              ),
              action: ({ row }) => (
                <div className="flex items-center justify-center">
                  <Dropdown
                    align="bottomRight"
                    overlayStyle={{ width: 124 }}
                    overlay={
                      user?.email && user?.email?.toLowerCase() !== EMAIL ? (
                        <Menu style={{ borderRadius: 4 }}>
                          <Menu.Item
                            key="0"
                            onClick={() =>
                              showModalAddNewServer(
                                row?.premium ? "PREMIUM" : "FREE",
                                row,
                              )
                            }
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            key="3"
                            onClick={() => {
                              Modal.confirm({
                                title: `Are you sure want to delete ${row?.country} server`,
                                onOk: () => remove(row),
                              });
                            }}
                          >
                            Remove
                          </Menu.Item>
                        </Menu>
                      ) : (
                        <span />
                      )
                    }
                    trigger={["click"]}
                  >
                    <UIButton className="icon" style={{ minWidth: 24 }}>
                      <img src={MoreIcon} alt="" width={24} height={24} />
                    </UIButton>
                  </Dropdown>
                </div>
              ),
            }}
            isReload={isReloadTable}
            service={"/admin/server/get"}
            search={searchValue}
            isHiddenPg={false}
            defineCols={[
              {
                name: () => (
                  <div className="text-left flex items-center">
                    <span>Countries</span>
                  </div>
                ),
                code: "country",
                sort: 1,
              },
              {
                name: () => <div className="text-center">State</div>,
                code: "state",
                sort: 2,
              },
              {
                name: () => <div className="text-center">Status</div>,
                code: "status",
                sort: 3,
              },
              {
                name: () => <div className="text-center">Premium</div>,
                code: "premium",
                sort: 4,
              },
              {
                name: <div className="text-center">IP Address</div>,
                code: "ipAddress",
                sort: 5,
              },
              // {
              //   name: <div className="text-center">recommend</div>,
              //   code: "recommend",
              //   sort: 6,
              // },
              {
                name: <div className="text-center">username</div>,
                code: "u_nsm",
                sort: 7,
              },
              {
                name: <div className="text-center">password</div>,
                code: "p_nsm",
                sort: 8,
              },
              {
                name: <div className="text-center">category</div>,
                code: "categories",
                render: (categories) => (
                  <div className="text-center">{categories.join(", ")}</div>
                ),
                sort: 9,
              },

              {
                name: () => <div className="text-center">Action</div>,
                code: "action",
                sort: "end",
              },
            ]}
            payload={{
              adminId: user?.id,
            }}
            queries={{
              ...filter,
              ...searchValue,
            }}
            headerWidth={{
              country: 200,
              action: 92,
              status: 90,
              premium: 90,
              recommend: 140,
              ipAddress: 139,
              state: 210,
            }}
            columns={[]}
          />
        </div>
      </div>
      {isShowAddServer.type && (
        <PremiumServer
          user={user}
          cb={() => setReloadTable(new Date().getTime().toString())}
          isPremium={isShowAddServer.type === "PREMIUM"}
          onCloseServe={onCloseAddServe}
          data={isShowAddServer.data}
        />
      )}
    </Layout>
  );
};

export default connect((state) => state)(Server);
