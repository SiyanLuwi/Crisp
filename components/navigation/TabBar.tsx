import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

const TabBar = ({
  state,
  descriptors,
  navigation,
  isVerified, // Add this line
}: {
  state: any;
  descriptors: any;
  navigation: any;
  isVerified: boolean; // Add this line
}) => {
  return (
    <View className="absolute bottom-[2%] w-auto flex-row justify-center items-center bg-white mx-[2%] py-[2%] rounded-3xl shadow-xl border-[#0C3B2D] border-2">
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          // Check if the route is one of the restricted ones
          if (["manage", "camera"].includes(route.name) && !isVerified) {
            Alert.alert(
              "Verification Required",
              "Please verify your account first."
            );
            return; // Do not navigate if not verified
          }

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Render icon if available
        const renderIcon = options.tabBarIcon
          ? options.tabBarIcon({
              color: isFocused ? "#0C3B2D" : "#000000",
              focused: isFocused,
            })
          : null;

        return (
          <TouchableOpacity
            key={route.key}
            className="flex-1 items-center justify-center my-3"
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {renderIcon}
            {/* Render text label conditionally */}
            {false && (
              <Text
                style={[
                  styles.tabBarText,
                  { color: isFocused ? "#0C3B2D" : "#000000" },
                ]}
              >
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarText: {
    fontSize: RFPercentage(2),
  },
});

export default TabBar;
