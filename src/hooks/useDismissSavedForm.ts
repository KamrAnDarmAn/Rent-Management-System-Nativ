import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

/** Remove the completed form while preserving a screen opened during its save. */
export function useDismissSavedForm() {
  const navigation = useNavigation();
  const route = useRoute();
  return () => {
    if (navigation.isFocused()) {
      if (navigation.canGoBack()) navigation.goBack();
      return;
    }
    navigation.dispatch((state) => {
      const source = state.routes.findIndex((r) => r.key === route.key);
      const routes = state.routes.filter((r) => r.key !== route.key);
      if (source < 0 || !routes.length) return CommonActions.reset(state);
      return CommonActions.reset({
        ...state,
        routes,
        index: Math.max(0, state.index - (source <= state.index ? 1 : 0)),
      });
    });
  };
}
