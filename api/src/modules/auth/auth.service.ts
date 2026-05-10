import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../../database/supabase.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const { data: user, error } = await this.supabase.db
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (error || !user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    if (user.status === 'BANNED') throw new UnauthorizedException('Account is banned');
    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Account is suspended');

    const tokens = await this.generateTokens(user.user_id, user.email, user.user_type);

    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.supabase.db
      .from('users')
      .update({ refresh_token_hash: refreshTokenHash, last_active: new Date().toISOString() })
      .eq('user_id', user.user_id);

    const { password_hash, refresh_token_hash, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const { data: user } = await this.supabase.db
        .from('users')
        .select('user_id, email, user_type, refresh_token_hash')
        .eq('user_id', payload.sub)
        .single();

      if (!user || !user.refresh_token_hash) throw new UnauthorizedException();

      const tokenValid = await bcrypt.compare(refreshToken, user.refresh_token_hash);
      if (!tokenValid) throw new UnauthorizedException('Refresh token invalid');

      const tokens = await this.generateTokens(user.user_id, user.email, user.user_type);
      const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
      await this.supabase.db
        .from('users')
        .update({ refresh_token_hash: refreshTokenHash })
        .eq('user_id', user.user_id);

      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  async logout(userId: string) {
    await this.supabase.db
      .from('users')
      .update({ refresh_token_hash: null })
      .eq('user_id', userId);
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const { data: user, error } = await this.supabase.db
      .from('users')
      .select('user_id, username, email, first_name, last_name, phone_number, profile_image_url, user_type, status, verification_level, rating, review_count, joined_date, last_active')
      .eq('user_id', userId)
      .single();

    if (error || !user) throw new UnauthorizedException();
    return user;
  }

  private async generateTokens(userId: string, email: string, userType: string) {
    const payload = { sub: userId, email, type: userType };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }
}
