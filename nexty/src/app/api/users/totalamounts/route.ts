import User from "@/models/userModel";
import { NextResponse ,NextRequest} from "next/server";
import {connect} from "@/dbConfig/dbConfig"

await connect();

export async function GET(request: NextRequest) {
    try {
        const users = await User.find({}, '_id username Amount paid'); // Fetch only username and Amount fields

        return NextResponse.json(
            { users },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}