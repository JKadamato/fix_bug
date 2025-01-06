import Layout from "@app/components/layout";
import React, { useState, useEffect } from "react";
import UISearch from "@app/components/core/input/search";
import { Select, Input, Switch, notification, Pagination, Spin } from "antd";
import { connect } from "react-redux";
import css from "styled-jsx/css";
import UIButton from "@app/components/core/button";
import { NewLocation } from "@app/modules/best-connection/components/detail";
import { GET, POST, PUT } from "@app/request";
import UICPopup from "@app/components/core/popup/cpopup";

const styles = css.global`
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e0e0e0;
    font-size: 13px;
    font-weight: 600;
  }

  tbody {
    height: auto !important;
  }

  thead {
    background-color: #ffffff !important;
  }

  th,
  td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: left;
  }

  tr {
    height: 40px !important;
    font-weight: 400;
  }

  th {
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
  }

  td img {
    width: 24px;
    height: auto;
    vertical-align: middle;
    margin-right: 10px;
  }

  select {
    width: 100%;
    padding: 5px;
  }

  tbody tr:nth-child(odd) {
    background-color: #f5f5f5; /* Màu nền cho dòng lẻ */
  }

  tbody tr:nth-child(even) {
    background-color: #ffffff; /* Màu nền cho dòng chẵn */
  }

  .rotate-icon {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
  }

  .dropdown-icon {
    transition: transform 0.3s ease;
  }

  .no-item-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  .no-item-container img {
    margin-bottom: 24px;
  }

  .no-item-container span {
    font-weight: 400;
  }

  .btn-cancel {
    background-color: #212121 !important;
    color: #fff;
  }

  button {
    background-color: #2da192 !important;
  }

  .ant-btn-circle.ant-btn-sm {
    display: none;
  }

  .ant-select {
    margin: 0;
    font-size: 13px;
  }

  .core-button.ghost {
    color: #fff !important;
    background-color: #212121 !important;
  }

  .ant-pagination-options {
    display: none;
  }

  .best-connections {
    position: relative;
    width: 100%;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
  }

  .country-item {
    padding: 8px 12px;
    display: flex;
    align-items: center;
  }

  .country-item:hover {
    background-color: #f5f5f5;
  }

  .ant-switch {
    background-color: #d9d9d9 !important;
  }

  .ant-switch-checked {
    background-color: #2da192 !important;
  }
`;

const BestConnection = ({ global: { user } }, data = undefined, onClose) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showSave, setSaveModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBestConnection, setSelectedBestConnection] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countries, setCountry] = useState([]);
  const [bestConnectionsByRow, setBestConnectionsByRow] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingPriorities, setLoadingPriorities] = useState({});
  const [selectedPriority, setSelectedPriority] = useState("");
  const [enabledStatus, setEnabledStatus] = useState({});
  const [searchValues, setSearchValues] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBestCountryList();
  }, [currentPage, searchValue, selectedPriority]);

  useEffect(() => {
    const savedStatus = JSON.parse(localStorage.getItem("enabledStatus")) || {};
    setEnabledStatus(savedStatus);

    setSelectedCountries((prevCountries) =>
      prevCountries.map((country) => ({
        ...country,
        enabled: savedStatus[country.locationId] ?? country.enabled,
      }))
    );
  }, []);

  // call API to fetch countries data
  const fetchCountries = async () => {
    const cachedCountries = localStorage.getItem("countriesData");
    if (cachedCountries) {
      const parsedData = JSON.parse(cachedCountries);
      setCountry(parsedData);
      setFilteredCountries(parsedData);

      if (data) {
        filterState(data?.countryCode, parsedData);
      }
    } else {
      const requestBody = {
        adminId: user?.id,
        id: user?.id,
      };

      try {
        const res = await POST("/admin/country/v4/get", requestBody);
        const countryData = res?.data?.data || [];
        setCountry(countryData);
        setFilteredCountries(countryData);

        localStorage.setItem("countriesData", JSON.stringify(countryData));

        if (data) {
          filterState(data?.countryCode, countryData);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    }
  };

  // call API to fetch best connection list
  const fetchBestCountryList = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        name: searchValue || "",
        priority: selectedPriority || "",
      });

      const apiUrl = `${
        process.env.API
      }/admin/country/v4/best-country?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          adminId: user?.id,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const { data } = await response.json();

      const bestCountryData = data?.rows || [];
      const savedStatus =
        JSON.parse(localStorage.getItem("enabledStatus")) || {};
      const tableData = bestCountryData.map((item) => ({
        location: item.countryId.name,
        locationId: item.countryId.id,
        bestConnections: item.countryAround.map((c) => c.name),
        priority: item.priority || "N/A",
        enabled: item.enabled || true,
        srcImg: item.countryId.iso2,
      }));

      const connectionsByRow = {};
      bestCountryData.forEach((item) => {
        connectionsByRow[item.countryId.id] = item.countryAround.map(
          (c) => c.name
        );
      });
      setBestConnectionsByRow(connectionsByRow);
      setSelectedCountries(tableData);
      setTotalItems(data?.meta?.total || 0);
      setTotalPages(data?.meta?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching best country data:", error);
      setSelectedCountries([]);
    }
  };

  // call API to create and update best connection
  const handleConfirmSave = async () => {
    setSaveModal(false);

    const selectedCountry = countries.find(
      (country) => country.name === selectedLocation?.name
    );

    if (!selectedCountry) {
      console.error("Không tìm thấy quốc gia đã chọn.");
      return;
    }

    const selectedPriority = selectedLocation?.priority || "N/A";

    const requestBody = {
      adminId: user?.id,
      countryId: selectedCountry.id,
      countryAround: selectedBestConnection.map(
        (connection) =>
          countries.find((country) => country.name === connection)?.id
      ),
      priority: selectedPriority,
    };

    console.log("Request Body:", requestBody);

    try {
      const response = await POST(
        "/admin/country/v4/best-country/create",
        requestBody
      );
      if (response.status === 200) {
        notification.info({
          description: `Best connection was created successfully`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification info",
        });

        await fetchBestCountryList();
      }
    } catch (error) {
      console.error(
        "Error creating best connection:",
        error.response?.data || error
      );
      notification.error({
        description: `Error creating best connection. Please try again.`,
        placement: "bottomRight",
        duration: 2,
        icon: "",
        className: "core-notification error",
      });
    }
  };

  // call API to update priority
  const handlePriorityChange = async (locationId, newPriority) => {
    setLoadingPriorities((prev) => ({ ...prev, [locationId]: true }));
    try {
      const selectedCountry = selectedCountries.find(
        (country) => country.locationId === locationId
      );

      if (!selectedCountry) {
        console.error("Không tìm thấy quốc gia.");
        return;
      }

      const requestBody = {
        adminId: user?.id,
        countryId: locationId,
        priority: newPriority,
        countryAround: bestConnectionsByRow[locationId]?.map(
          (connection) =>
            countries.find((country) => country.name === connection)?.id
        ),
        enabled: selectedCountry.enabled,
      };

      const response = await PUT(
        `/admin/country/v4/best-country/${locationId}`,
        requestBody
      );

      if (response.status === 200) {
        setSelectedCountries((prevCountries) =>
          prevCountries.map((country) =>
            country.locationId === locationId
              ? { ...country, priority: newPriority }
              : country
          )
        );

        notification.info({
          description: `Priority was updated successfully`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification info",
        });
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      notification.error({
        description: `Error updating priority. Please try again.`,
        placement: "bottomRight",
        duration: 2,
        icon: "",
        className: "core-notification error",
      });
    } finally {
      setLoadingPriorities((prev) => ({ ...prev, [locationId]: false }));
    }
  };

  // call API to update action enable/disable
  const handleToggleEnabled = async (locationId, isEnabled) => {
    try {
      const requestBody = {
        adminId: user?.id,
        countryId: locationId,
        countryAround:
          bestConnectionsByRow[locationId]?.map(
            (connection) =>
              countries.find((country) => country.name === connection)?.id
          ) || [],
        priority:
          selectedCountries.find((country) => country.locationId === locationId)
            ?.priority || "N/A",
        enabled: isEnabled,
      };

      const response = await PUT(
        `/admin/country/v4/best-country/${locationId}`,
        requestBody
      );

      if (response?.status === 200) {
        setSelectedCountries((prevCountries) =>
          prevCountries.map((country) =>
            country.locationId === locationId
              ? { ...country, enabled: isEnabled }
              : country
          )
        );

        // Lưu trạng thái vào localStorage
        setEnabledStatus((prevStatus) => {
          const updatedStatus = { ...prevStatus, [locationId]: isEnabled };
          localStorage.setItem("enabledStatus", JSON.stringify(updatedStatus));
          return updatedStatus;
        });

        notification.info({
          description: `Location ${
            isEnabled ? "enabled" : "disabled"
          } successfully.`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification info",
        });
      } else {
        console.error("Error updating location status:", response);
        throw new Error(response?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating location status:", error);
      notification.error({
        description: `Error updating location status. Please try again.`,
        placement: "bottomRight",
        duration: 2,
        icon: "",
        className: "core-notification error",
      });
    }
  };

  // call API to save best connection to API
  const updateBestConnectionToApi = async (locationId, updatedConnections) => {
    try {
      const requestBody = {
        adminId: user?.id,
        countryId: locationId,
        countryAround: updatedConnections.map(
          (connection) =>
            countries.find((country) => country.name === connection)?.id
        ),
        priority:
          selectedCountries.find((country) => country.locationId === locationId)
            ?.priority || "N/A",
        enabled:
          selectedCountries.find((country) => country.locationId === locationId)
            ?.enabled || true,
      };

      const response = await PUT(
        `/admin/country/v4/best-country/${locationId}`,
        requestBody
      );

      if (response?.status === 200) {
        notification.info({
          description: `Best connections updated successfully.`,
          placement: "bottomRight",
          duration: 2,
          icon: "",
          className: "core-notification info",
        });
      } else {
        throw new Error("Failed to update best connections.");
      }
    } catch (error) {
      console.error("Error updating best connections:", error);
      notification.error({
        description: `Error updating best connections. Please try again.`,
        placement: "bottomRight",
        duration: 2,
        icon: "",
        className: "core-notification error",
      });
    }
  };

  // pagination
  const updateQueryParams = (page, limit) => {
    const currentQuery = new URLSearchParams(window.location.search);
    currentQuery.set("page", page);
    currentQuery.set("limit", limit);
    const newUrl = `${window.location.pathname}?${currentQuery.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBestCountryList();
    updateQueryParams(page, itemsPerPage);
  };

  const paginatedCountries = selectedCountries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showModalNewLocation = async () => {
    setShowPopup(true);
    setSelectedLocation({});
    setSelectedBestConnection([]);
  };

  const closeModal = () => {
    setShowPopup(false);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);

    if (!location.locationId) {
      setSelectedBestConnection([]);
    } else {
      setSelectedBestConnection(
        bestConnectionsByRow[location.locationId] || []
      );
    }

    setSelectedCountries((prev) => {
      const isExist = prev.some(
        (item) => item.locationId === location.locationId
      );
      if (!isExist) {
        return [...prev, location];
      }
      return prev;
    });

    closeModal();
  };

  const handleBestConnectionChange = (locationId, newConnections) => {
    setBestConnectionsByRow((prevState) => ({
      ...prevState,
      [locationId]: newConnections,
    }));

    updateBestConnectionToApi(locationId, newConnections);
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Hàm tìm kiếm quốc gia
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);

    // Lọc danh sách quốc gia dựa trên tên
    const filtered = countries.filter((country) =>
      country?.name?.toLowerCase().startsWith(value)
    );
    setFilteredCountries(filtered);
  };

  // search location selected
  const handleSearchLocation = (value) => {
    const searchText = value.toLowerCase();
    setSearchValue(searchText);

    const filtered = selectedCountries.filter(
      (country) =>
        country.location &&
        country.location.toLowerCase().startsWith(searchText)
    );

    setFilteredCountries(filtered);
  };

  const handleSearchChange = (locationId, value) => {
    setSearchValues((prevState) => ({
      ...prevState,
      [locationId]: value,
    }));
  };

  return (
    <Layout title="Best Connection">
      <div className="core-card">
        <div className="flex justify-between">
          <div className="flex">
            <UISearch
              placeholder="Search Location"
              onChange={(e) => handleSearchLocation(e.target.value)}
            />
            <div className="flex ml-10 items-center">
              <div className="mr-3 pa-13 font-bold text-black">Filter by:</div>
              <div className="flex ml-3">
                <Select
                  placeholder="All Priority"
                  style={{ width: 123 }}
                  value={selectedPriority || undefined}
                  onChange={(value) => setSelectedPriority(value)}
                >
                  <Select.Option value="cpu">CPU</Select.Option>
                  <Select.Option value="ram">RAM</Select.Option>
                  <Select.Option value="conn">Connection</Select.Option>{" "}
                </Select>
              </div>
            </div>
          </div>
          <div>
            <UIButton onClick={showModalNewLocation} className="third">
              New
            </UIButton>
          </div>
        </div>

        <div className="mt-6">
          <table>
            <thead>
              <tr>
                <th className="w-2/12">Location</th>
                <th className="text-center">Best Connections Suggested</th>
                <th className="w-2/12">Priority</th>
                <th className="w-1/12">Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedCountries.map((item, index) => (
                <tr
                  key={item.locationId || index}
                  style={{ border: "1px solid #E0E0E0", height: "53px" }}
                >
                  {/* Cột Location */}
                  <td style={{ border: "none" }}>
                    <div className="flex items-center">
                      <img
                        className="rounded-full mr-2"
                        style={{ border: "2px solid #f5f5f5" }}
                        src={`/flags/${(
                          item.srcImg || item.countryId?.iso2
                        )?.toLowerCase()}.svg`}
                        width={24}
                        height={24}
                        alt={item.location || item.countryId?.name}
                      />
                      <div>{item.location || item.countryId?.name}</div>
                    </div>
                  </td>

                  {/* Cột Best Connections */}
                  <td style={{ border: "1px solid #E0E0E0" }}>
                    <Select
                      className="w-full"
                      placeholder="Select Best Connections"
                      value={bestConnectionsByRow[item.locationId] || []}
                      mode="multiple"
                      onChange={(newConnections) =>
                        handleBestConnectionChange(
                          item.locationId,
                          newConnections
                        )
                      }
                    >
                      {filteredCountries.map((country) => (
                        <Select.Option key={country.id} value={country.name}>
                          {country.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </td>
                  <td style={{ border: "1px solid #E0E0E0" }}>
                    <Select
                      className="w-full"
                      placeholder="Select Priority"
                      value={item.priority || undefined}
                      onChange={(value) =>
                        handlePriorityChange(item.locationId, value)
                      }
                    >
                      <Select.Option value="cpu">CPU</Select.Option>
                      <Select.Option value="ram">RAM</Select.Option>
                      <Select.Option value="conn">Connection</Select.Option>
                    </Select>
                  </td>
                  <td style={{ border: "none" }}>
                    <Switch
                      checked={item.enabled}
                      onChange={(enabled) =>
                        handleToggleEnabled(item.locationId, enabled)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>{" "}
          </table>
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={totalItems} // Sử dụng tổng số phần tử từ API
            onChange={handlePageChange}
            className="mt-4 flex justify-end"
          />{" "}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-0 border-t border-solid border-gray-200">
        <UIButton className="mr-4 btn-cancel">Cancel</UIButton>
        <UIButton
          htmlType="submit"
          className="third"
          disabled={!selectedLocation || !selectedBestConnection}
          onClick={() => setSaveModal(true)}
        >
          Save
        </UIButton>
      </div>

      {showPopup && (
        <div onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()}>
            <NewLocation
              closeModal={closeModal}
              onSelectLocation={handleSelectLocation}
            />
          </div>
        </div>
      )}

      {showSave && (
        <UICPopup
          textOk="Confirm"
          textCancel="Cancel"
          title={"Save The Change"}
          onCancel={() => setSaveModal(false)}
          children="Are you sure to save this change? This action will take time and be not able to revert"
          onOk={handleConfirmSave}
        />
      )}

      <style jsx>{styles}</style>
    </Layout>
  );
};

export default connect((state) => state)(BestConnection);
