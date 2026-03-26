import { Controller, Get } from '@nestjs/common';

@Controller('meta')
export class MetaController {
    @Get('agent-config')
    getAgentConfig() {
        return {
            sectors: ['Finance', 'IT', 'HR', 'Operations', 'Support'],
            levels: [
                { id: 'L1', value: 1, label: 'L1 — Junior (Email)', description: 'L1 agents handle tickets via email. They can resolve or escalate to L2.' },
                { id: 'L2', value: 2, label: 'L2 — Mid (Phone Call)', description: 'L2 agents handle escalated tickets via phone call. They can resolve or escalate to L3.' },
                { id: 'L3', value: 3, label: 'L3 — Senior (Physical Visit)', description: 'L3 agents handle the most complex tickets via physical visit. Final escalation level.' },
            ],
        };
    }
}
