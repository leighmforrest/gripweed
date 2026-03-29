import React from "react";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";
import * as CiIcons from "react-icons/ci";

const iconSets = {
  fa: FaIcons,
  fa6: Fa6Icons,
  md: MdIcons,
  ci: CiIcons
};

const Icon = ({
  name,
  set = "fa",
  size = 24,
  color = "currentColor",
  className = "",
}) => {
  const IconComponent = iconSets[set][name];
  return <IconComponent size={size} color={color} className={className} />;
};

export default Icon;
