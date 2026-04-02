import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { useAuth } from "./src/hooks/useAuth";

// Screens
import AuthScreen from "./src/screens/AuthScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import FormScreen from "./src/screens/FormScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import RecipesScreen from "./src/screens/RecipesScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Bar Icon ─────────────────────────────────────────────────────────────

const TabIcon = ({ name, focused, label }) => (
  <View style={tabStyles.iconWrap}>
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={24}
      color={focused ? "#32CD32" : "#555"}
    />
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
      {label}
    </Text>
  </View>
);

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: "#555",
    fontWeight: "600",
  },
  labelActive: {
    color: "#32CD32",
  },
});

// ─── Tab Navigator (ecrãs autenticados) ──────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#161616",
          borderTopColor: "#222",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} label="Início" />
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="restaurant" focused={focused} label="Receitas" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} label="Perfil" />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" focused={focused} label="Definições" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Stack Navigator principal ────────────────────────────────────────────────

function Navigation() {
  const { session, hasProfile, isLoading } = useAuth();
  const navigationRef = useRef(null);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!session) hasNavigated.current = false;
  }, [session]);

  useEffect(() => {
    if (isLoading || !navigationRef.current) return;

    const currentRoute = navigationRef.current.getCurrentRoute()?.name;

    if (
      !session &&
      currentRoute !== "Auth" &&
      currentRoute !== "ResetPassword"
    ) {
      hasNavigated.current = false;
      navigationRef.current.reset({ index: 0, routes: [{ name: "Auth" }] });
      return;
    }

    if (session && currentRoute === "Auth" && !hasNavigated.current) {
      hasNavigated.current = true;
      const target = hasProfile ? "Main" : "Form";
      navigationRef.current.reset({ index: 0, routes: [{ name: target }] });
      return;
    }

    if (session && currentRoute === "Form" && hasProfile) {
      navigationRef.current.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  }, [session, hasProfile, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#121212",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!session) return "Auth";
    if (hasProfile) return "Main";
    return "Form";
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        {/* Ecrãs sem autenticação */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Form" component={FormScreen} />

        {/* App principal — bottom tabs */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Ecrãs que ficam por cima dos tabs (sem tab bar) */}
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
