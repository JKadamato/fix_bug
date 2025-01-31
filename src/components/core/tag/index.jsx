import React from "react";
import css from "styled-jsx/css";

const styles = css`
  .core-tag {
    width: 65px;
    height: 16px;
    border-radius: 4px;
    font-size: 8px;
    line-height: 1.25;
    letter-spacing: 1.28px;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    &.primary {
      color: #2f6fa7;
      border: solid 1px #2f6fa7;
      background-color: #d5caff;
    }
    &.second {
      color: var(--third-color);
      border: solid 1px var(--third-color);
      background-color: var(--third-color-30);
    }
  }
`;

const Tag = ({ type = "primary", children, className = "", style = {} }) => (
  <span className={`core-tag ${type} ${className}`} style={style}>
    {children}
    <style jsx>{styles}</style>
  </span>
);

export default Tag;
