import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminService } from './admin.service';

@Module({ imports: [AuthModule], controllers: [AdminController], providers: [AdminService, AdminRoleGuard] })
export class AdminModule {}
