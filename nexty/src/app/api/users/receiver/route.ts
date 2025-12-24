import {getTokenData} from "@/helpers/tokenData";
import {NextResponse} from "next/server";
import  {NextRequest} from "next/server";
import User from "@/models/userModel";
import {connect} from "@/dbConfig/dbConfig";

await connect();

export async function POST(request: NextRequest) {
    try {
        const {id} = await request.json();

        console.log(id);

        const user = await User.findById(id).select("-password");
    

        if (!user) {
            return NextResponse.json(
                {message: user},
                {status: 404}
            );
        }

        return NextResponse.json(
            {user},
            {status: 200}
        );

    } catch (error) {
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500}
        );
    }
}
