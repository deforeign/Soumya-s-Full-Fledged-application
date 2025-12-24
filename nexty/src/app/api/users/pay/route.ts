import User from "@/models/userModel";
import { NextResponse ,NextRequest} from "next/server";
import {connect} from "@/dbConfig/dbConfig"

await connect();

export async function POST(request: NextRequest) {
    try {
        const { senderId, receiverId } = await request.json();

        const user = await User.findByIdAndUpdate(receiverId, 
            { 
                paid: true , 
                sender: String(senderId),
                paymentTime: new Date(),

            }, 
            { new: true });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "UPI ID updated successfully", user },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}