import {Tabs} from "expo-router";
import Home from "@/app/(tabs)/index";

export default function  TabsLayout(){
    return (
        <>
            <Tabs>
                <Tabs.Screen name="index"  />
            </Tabs>
        </>
    )
}