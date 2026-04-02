import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const FormHeader = ({ title, onBack, showBackButton }) => (
  <View style={styles.header}>
    {showBackButton && (
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    )}
    <Text
      style={[
        styles.title,
        { textAlign: showBackButton ? "left" : "center", flex: 1 },
      ]}
    >
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    marginTop: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.textPrimary },
});
