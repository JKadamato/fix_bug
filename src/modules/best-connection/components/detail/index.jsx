import UICPopup from "@app/components/core/popup/cpopup";
import React, { useEffect, useState, useRef } from "react";
import { SearchOutlined } from "@ant-design/icons";
import UIButton from "@app/components/core/button";
import css from "styled-jsx/css";

const styles = css.global`
  .shdvn-ui-popup__body {
    height: 700px;
  }
`;

export const NewLocation = ({
  onCloseServe,
  data = undefined,
  user,
  onSelectLocation,
  closeModal,
  setNewItem,
}) => {
  const [countries, setCountry] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);

  const popupRef = useRef(null);

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

  const handleSelectLocation = (item) => {
    const location = item.name;
    const locationId = item.id;
    const priority = item.priority || "cpu";
    const enabled = true;
    const bestConnections = [location];
    const srcImg = item?.iso2;

    onSelectLocation({
      location,
      locationId,
      bestConnections,
      priority,
      enabled,
      srcImg,
    });

    setNewItem((prev) => ({
      ...prev,
      priority: priority,
    }));

    closeModal();
  };

  return (
    <UICPopup
      hiddenFooter={true}
      textCancel="Cancel"
      autoClose={true}
      onCancel={closeModal}
    >
      <div>
        <div className="flex flex-col mb-4">
          <span className="font-semibold mb-2">New Location</span>
          <span>Please select a location below</span>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Search Country"
            value={searchValue}
            onChange={handleSearch}
            style={{
              backgroundColor: "#F6F6F6",
              border: "1px solid #E0E0E0",
            }}
          />

          <div
            className="absolute"
            style={{
              right: 8,
              top: 10,
            }}
          >
            <SearchOutlined style={{ fontSize: 20 }} />
          </div>
        </div>

        <div className="country-list">
          {filteredCountries?.map((item) => (
            <label
              key={item?.id}
              htmlFor={item?.id}
              className="country-item p-2 border-b cursor-pointer flex items-center hover:bg-[#eaf1f7]"
              onClick={() => handleSelectLocation(item)}
            >
              <input
                type="checkbox"
                className="mr-3 w-[30px] h-[30px]"
                id={item?.id}
              />
              <img
                className="rounded-full mr-2"
                style={{ border: "2px solid #f5f5f5" }}
                src={`/flags/${(item?.iso2).toLowerCase()}.svg`}
                width={24}
                height={24}
                alt={item?.name}
              />
              <div>{item?.name}</div>
            </label>
          ))}
        </div>
      </div>
      <style jsx>{styles}</style>
    </UICPopup>
  );
};
