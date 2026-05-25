import {ScrollView, Text} from "react-native";
import {Link} from "expo-router";

export default function HomeScreen() {
  return (
      <ScrollView className={"bg-background"} >
          <Text className={"text-primary"}>Hello WOrld</Text>
          <Link href={"/(auth)/register"}>Register</Link>
      </ScrollView>
  );
}
