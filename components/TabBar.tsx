import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

const TabBar = ({ state, descriptors, navigation }: { state: any, descriptors: any, navigation: any }) => {
  return (
    <View style={styles.tabBar}>
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
        const renderIcon = options.tabBarIcon ? options.tabBarIcon({ color: isFocused ? "green" : "#000000", focused: isFocused }) : null;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabBarItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {renderIcon}
            <Text style={[styles.tabBarText, { color: isFocused ? "green" : "#000000" }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F0F4C3',
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  tabBarItem: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  tabBarText: {
    fontSize: 16,
  },
});

export default TabBar;
