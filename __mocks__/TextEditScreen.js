// Mock for TextEditScreen component
const React = require("react");
const { View, Text, TextInput, TouchableOpacity } = require("react-native");

const mockTextEditScreen = (props) => {
  const { route } = props;
  const { extractedText = "" } = route?.params || {};

  return React.createElement(
    View,
    { testID: "text-edit-screen" },
    React.createElement(TextInput, {
      testID: "text-input",
      value: extractedText,
      placeholder: "textEdit.placeholder",
      multiline: true,
    }),
    React.createElement(
      TouchableOpacity,
      { testID: "reset-button" },
      React.createElement(Text, null, "textEdit.reset")
    )
  );
};

module.exports = mockTextEditScreen;
