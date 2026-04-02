import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../../utils/theme";

export const SaveButton = ({
  onPress,
  loading,
  disabled,
  text = "GUARDAR PERFIL",
}) => (
  <TouchableOpacity
    style={[styles.button, (loading || disabled) && styles.buttonDisabled]}
    onPress={onPress}
    disabled={loading || disabled}
  >
    {loading ? (
      <ActivityIndicator color={COLORS.textInverse} />
    ) : (
      <>
        <Ionicons
          name="save-outline"
          size={20}
          color={COLORS.textInverse}
          style={styles.icon}
        />
        <Text style={styles.text}>{text}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  icon: { marginRight: 10 },
  text: { color: COLORS.textInverse, fontWeight: "bold", fontSize: 16 },
});
