import React, { useState } from "react";
import { View, Text } from "react-native";
import CheckBox from "react-native-checkbox";

const MultipleCheckBox = ({ titles }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckBoxToggle = (item, isChecked) => {
    if (isChecked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter((selected) => selected !== item));
    }
  };

  return (
    <View>
      <Text>Select multiple items:</Text>
      {titles.map((item) => {
        <CheckBox
          label={item.title}
          checked={selectedItems.includes(item.title)}
          onChange={(isChecked) => handleCheckBoxToggle(item.title, isChecked)}
        />;
      })}
    </View>
  );
};

export default MultipleCheckBox;
