import {
  Controller, Get, Post, Patch, Body, Param, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TestsService } from './tests.service';
import { AssignTestDto } from './dto/assign-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'Mevcut psikolojik testler' })
  findAll() {
    return this.testsService.findAllTests();
  }

  @Get('assigned')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Atanan bekleyen testler (danışan)' })
  getAssigned(@CurrentUser() user: JwtPayload) {
    return this.testsService.getAssignedTests(user.sub);
  }

  @Get('results/me')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Danışanın tamamlanan test sonuçları' })
  myResults(@CurrentUser() user: JwtPayload) {
    return this.testsService.getMyTestResults(user.sub);
  }

  @Get('results/:resultId')
  @ApiOperation({ summary: 'Test sonucu detayı (cevaplama için sorular dahil)' })
  getResult(@Param('resultId') resultId: string, @CurrentUser() user: JwtPayload) {
    return this.testsService.getTestResultForClient(resultId, user.sub, user.role as Role);
  }

  @Post('results/:resultId/submit')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Test cevaplarını gönder (danışan)' })
  submitByResultId(
    @Param('resultId') resultId: string,
    @Body() body: { answers: { questionId: string; value: number }[] },
    @CurrentUser() user: JwtPayload,
  ) {
    const dto: SubmitTestDto = {
      testResultId: resultId,
      answers: body.answers.map(a => a.value),
    };
    return this.testsService.submitTest(dto, user.sub);
  }

  @Post('assign')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Danışana test ata (psikolog)' })
  assign(@Body() dto: AssignTestDto, @CurrentUser() user: JwtPayload) {
    return this.testsService.assignTest(dto, user.sub);
  }

  @Post('submit')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Test cevaplarını gönder (danışan) - eski endpoint' })
  submit(@Body() dto: SubmitTestDto, @CurrentUser() user: JwtPayload) {
    return this.testsService.submitTest(dto, user.sub);
  }

  @Get('progress/:clientUserId')
  @ApiOperation({ summary: 'Danışan ilerleme grafiği verileri' })
  getProgress(@Param('clientUserId') clientUserId: string, @CurrentUser() user: JwtPayload) {
    return this.testsService.getClientProgress(clientUserId, user.sub, user.role as Role);
  }

  @Patch('results/:resultId/share')
  @Roles(Role.PSYCHOLOGIST)
  @ApiOperation({ summary: 'Test sonucunu danışanla paylaş/gizle (psikolog)' })
  toggleShare(
    @Param('resultId') resultId: string,
    @Body() body: { isSharedWithClient: boolean },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.testsService.toggleShareWithClient(resultId, user.sub, body.isSharedWithClient);
  }

  @Get('results/:psychologistId/client/:clientId')
  @Roles(Role.PSYCHOLOGIST, Role.ADMIN)
  @ApiOperation({ summary: 'Danışana ait tüm test sonuçları (psikolog/admin)' })
  getClientResults(
    @Param('clientId') clientId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.testsService.getClientTestResults(clientId, user.sub, user.role as Role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Test detayı' })
  findOne(@Param('id') id: string) {
    return this.testsService.findTestById(id);
  }
}
