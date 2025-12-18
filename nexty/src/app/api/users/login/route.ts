import {connect} from "@/dbConfig/dbConfig"
import User from "@/models/userModel"
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";


await connect();


export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { username, email, password } = reqBody;

        console.log(reqBody);

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const response = NextResponse.json(
            {   message: "Login successful",
                username: user.username,
                status: 200
            },
            
        );

        const token = await jwt.sign(
            { userId: user._id, email: user.email },
            process.env.TOKEN_SECRET!,
            { expiresIn: "1d" }
        );
        response.cookies.set("token", token, {
            httpOnly: true
        });



        return response;

    } catch (error) {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}