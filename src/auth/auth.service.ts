import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  UserRole,
} from '../schemas/userSchema/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) { }

  // Signup
  async signup(data: SignupDto) {
    const { email, password, name, role } = data;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userModel.create({
      name,
      email,
      password,
      role: role || UserRole.CUSTOMER,
    });

    return this.generateToken(user);
  }

  // Login
  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  // Create Agent (Admin Only)
  async createAgent(data: SignupDto & { sector?: string; supportLevel?: number }) {
    const { email, password, name, sector, supportLevel } = data;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userModel.create({
      name,
      email,
      password,
      role: UserRole.AGENT,
      sector,
      supportLevel: supportLevel || 1,
    });

    return {
      message: 'Agent created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        sector: user.sector,
        supportLevel: user.supportLevel,
      },
    };
  }

  //  JWT Token
  private generateToken(user: UserDocument) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
