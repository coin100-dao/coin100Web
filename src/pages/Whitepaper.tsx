// src/components/Whitepaper.tsx

import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  faChartLine,
  faCoins,
  faBalanceScale,
  faShieldAlt,
  faUsers,
  faRocket,
  faCode,
  faChartPie,
  faHandshake,
  faGlobe,
  faChevronDown,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faqData from '../data/faq.json';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

type RoadmapPhase = {
  phase: string;
  items: string[];
};

type SectionContent = string | string[] | RoadmapPhase[];

interface Section {
  id: string;
  title: string;
  icon: IconDefinition;
  content?: SectionContent;
  subSections?: Array<{
    title: string;
    content: string;
  }>;
}

const Whitepaper: React.FC = () => {
  const theme = useTheme();

  const sections: Section[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: faChartLine,
      content: `COIN100 (C100) is a decentralized cryptocurrency index fund built on the Polygon network. 
      It represents the top 100 cryptocurrencies by market capitalization, mirroring the performance of the overall crypto market. 
      Inspired by traditional index funds like the S&P 500, C100 provides a diversified, market-wide exposure to the crypto industry 
      without requiring active portfolio management from investors.`,
    },
    {
      id: 'problem-statement',
      title: 'Problem Statement',
      icon: faBalanceScale,
      content: `The crypto market can be volatile and fragmented. Investors seeking broad exposure face challenges in selecting 
      and maintaining a balanced portfolio of top assets. Without a simple mechanism to track the aggregate performance of the 
      top 100 cryptocurrencies, investors may either miss growth opportunities or take on unnecessary risk.`,
    },
    {
      id: 'solution',
      title: 'Solution: COIN100 (C100) Token',
      icon: faCoins,
      content: [
        'Offering a token that represents a proportional share of the top 100 crypto market cap.',
        'Automatically adjusting each holder’s balance through global rebases as the top 100 market cap changes.',
        'Implementing dynamic pricing mechanisms for `polRate`.',
        'Introducing fee-based treasury growth and configurable liquidity provider rewards.',
        'Reducing complexity for investors who want broad market exposure without active rebalancing.',
      ],
    },
    {
      id: 'key-principles',
      title: 'Key Principles and Features',
      icon: faShieldAlt,
      subSections: [
        {
          title: 'Fairness and Equal Treatment of Holders',
          content: `Every holder’s balance scales proportionally with changes in the total market cap. No single participant is advantaged or disadvantaged during rebases.`,
        },
        {
          title: 'Global Rebase Mechanism',
          content: `On each upkeep call, the total supply adjusts to reflect the updated top 100 crypto market cap. All balances scale equally, maintaining each holder’s fractional ownership.`,
        },
        {
          title: 'Manual Upkeep in Initial Phase',
          content: `Early on, the owner will manually call the rebase function with updated market cap figures. Over time, this process can transition to an automated system (e.g., via a governance proposal and oracle integration).`,
        },
        {
          title: 'Dynamic `polRate` Update',
          content: `The \`polRate\` (C100 per POL) is dynamically updated based on the reserves in the \`C100-POL\` liquidity pool. If the primary pool is unavailable, the system falls back to the \`C100-USDC\` pool using a predefined \`polInUSDCRate\`. This ensures accurate and real-time pricing adjustments aligned with market conditions.`,
        },
        {
          title: 'Fee-Based Treasury Growth',
          content: `C100 introduces transfer fees that can be enabled or disabled by the admin. When enabled, a portion of each transaction is sent to a designated treasury address, facilitating continuous growth and funding for development, marketing, and other strategic initiatives.`,
        },
        {
          title: 'Configurable Liquidity Provider Rewards',
          content: `Liquidity providers are incentivized through a configurable reward system. Initially set to 5% of supply changes during rebases, this percentage can be adjusted up to a maximum of 10% based on community governance, allowing flexibility in rewarding liquidity contributors.`,
        },
        {
          title: 'No Complex Public Sale Mechanics',
          content: `C100 emphasizes simplicity in its public sale to ensure broad accessibility and ease of participation for all investors.`,
        },
      ],
    },
    {
      id: 'tokenomics',
      title: 'Tokenomics',
      icon: faChartPie,
      subSections: [
        {
          title: 'Initial Parameters',
          content: `- **Total Supply:** Equal to the initial top 100 crypto market cap (denominated in C100 units).  
          - **Initial Price:** Approximately $1 per C100 token, assuming pairing with a stable asset in a DEX.`,
        },
        {
          title: 'Distribution (Owner Allocation & ICO)',
          content: `- **Owner Allocation:** 3% of total supply is retained by the owner for development, liquidity provision, and other strategic purposes.  
          - **ICO Allocation:** 90% of total supply is allocated for the Initial Coin Offering (ICO), enabling widespread distribution and community participation.`,
        },
        {
          title: 'Rebase Formula ("Genius" Formula)',
          content: `**ratio = M_new / M_old**  
          - **New Supply = Old Supply * ratio**  
          - Every holder’s balance is multiplied by the same ratio.  
          This ensures fair and transparent tracking of the market cap changes.`,
        },
        {
          title: 'Market Dynamics and Price Stability',
          content: `If the market cap doubles, all balances double, maintaining the token’s value reference. As the community matures and markets become more efficient, the token price should remain stable around its baseline in response to these proportional adjustments.`,
        },
        {
          title: 'Liquidity Provider Rewards',
          content: `A dedicated percentage of the supply changes during rebases is allocated as rewards to liquidity providers. Initially set to 5%, this can be adjusted up to 10% based on governance decisions. This incentivizes users to provide liquidity, ensuring deep liquidity pools, reducing slippage, and fostering a robust trading environment.`,
        },
        {
          title: 'Fee-Based Treasury',
          content: `When enabled, transfer fees are collected and sent to a designated treasury address. This mechanism supports the growth and sustainability of the project by funding development, marketing, audits, and other strategic initiatives.`,
        },
      ],
    },
    {
      id: 'technical-architecture',
      title: 'Technical Architecture',
      icon: faCode,
      subSections: [
        {
          title: 'Polygon Network',
          content: `Deployed on Polygon for low gas fees and high throughput, ensuring efficient and cost-effective transactions for users.`,
        },
        {
          title: 'C100 Token Contract',
          content: `Implements ERC20 standards, rebase logic, ownership control, pause/unpause functionalities, transfer fee mechanisms, liquidity provider rewards allocation, and integration points for future governance.`,
        },
        {
          title: 'ICO (Public Sale) Contract',
          content: `Handles the initial distribution of 90% tokens. Investors purchase C100 with POL or approved ERC20 tokens (e.g., USDC) during the ICO period. Unsold tokens are burned at the end, ensuring only the circulating supply reflects real participants. Additionally, during the ICO, a configurable reward percentage is allocated to liquidity providers from the transaction fees to incentivize liquidity provisioning.`,
        },
        {
          title: 'Scaling and GonsPerFragment',
          content: `Balances are tracked in a large integer unit called “gons.” The global \`gonsPerFragment\` variable determines how these translate into user balances. On rebase, adjusting \`gonsPerFragment\` updates everyone’s balance proportionally in O(1) complexity.`,
        },
        {
          title: 'Dynamic `polRate` Mechanism',
          content: `The \`polRate\` is dynamically determined based on the reserves in the \`C100-POL\` liquidity pool. If unavailable, it falls back to the \`C100-USDC\` pool using a predefined \`polInUSDCRate\`. This ensures accurate pricing aligned with market conditions.`,
        },
      ],
    },
    {
      id: 'governance',
      title: 'Governance',
      icon: faUsers,
      subSections: [
        {
          title: 'Transition from Owner to Governor',
          content: `Initially, the owner manages the contract. Later, a governor contract can be introduced. The governor can propose and vote on changes (parameters, treasury usage, etc.), enabling community-driven evolution.`,
        },
        {
          title: 'Future Governor Contract',
          content: `By deploying a governor contract and timelock controller, the project gradually moves towards full decentralization. Governance token holders can vote on upgrades, new features, or parameter changes (e.g., adjusting the rebase frequency, transfer fees, or liquidity rewards).`,
        },
        {
          title: 'Community Involvement',
          content: `Over time, the community will shape the project’s future. They can propose:
          - Adjusting parameters (fees, rebase frequency)
          - Allocating treasury funds for development, marketing, or liquidity
          - Introducing new features or improvements
          - Managing liquidity provider reward percentages`,
        },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      icon: faShieldAlt,
      subSections: [
        {
          title: 'Ownership Controls',
          content: `The \`onlyAdmin\` modifiers ensure that only authorized parties (owner or governor) can make critical changes, safeguarding the contract against unauthorized modifications.`,
        },
        {
          title: 'Pause/Unpause Mechanisms',
          content: `The contract can be paused in emergencies, preventing transfers and safeguarding against exploits during uncertain times.`,
        },
        {
          title: 'Reentrancy Guards',
          content: `NonReentrant modifiers protect against complex reentrancy attacks, ensuring safe execution of functions like buying tokens or rebasing.`,
        },
        {
          title: 'Audits and Best Practices',
          content: `Smart contract auditing and community code reviews will enhance trust and security. Following industry standards, best practices, and thorough testing before mainnet deployment is crucial.`,
        },
        {
          title: 'Token Rescue and Burning',
          content: `Admins can rescue non-C100 tokens sent to the contract and burn unsold C100 tokens post-ICO. Additionally, tokens can be burned from the treasury to manage supply and support market stability.`,
        },
      ],
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      icon: faRocket,
      content: [
        {
          phase: 'Phase 1: Launch',
          items: [
            'Smart Contract Development',
            'Core token contract implementation',
            'ICO contract development',
            'Security features integration',
            'Security Audits',
            'Multiple independent audits',
            'Bug bounty program',
            'Community code review',
            'Initial Community Building',
            'Social media presence establishment',
            'Community channels setup',
            'Educational content creation',
            'ICO Launch',
            'Public sale initiation',
            'Liquidity pool creation',
            'Initial market making',
          ],
        },
        {
          phase: 'Phase 2: Growth',
          items: [
            'Exchange Listings',
            'DEX integrations',
            'CEX partnerships',
            'Market maker relationships',
            'Marketing Campaigns',
            'Brand awareness initiatives',
            'Influencer collaborations',
            'Educational webinars',
            'Community Expansion',
            'Ambassador program',
            'Regional community groups',
            'Content creator network',
            'Partnership Development',
            'Strategic alliances',
            'Integration partnerships',
            'Cross-protocol collaborations',
          ],
        },
        {
          phase: 'Phase 3: Evolution',
          items: [
            'Oracle Integration',
            'Chainlink implementation',
            'Automated market cap tracking',
            'Price feed optimization',
            'Automated Rebase System',
            'Smart contract upgrades',
            'Automated execution',
            'Fail-safe mechanisms',
            'Enhanced Market Analytics',
            'Real-time tracking dashboard',
            'Performance metrics',
            'Market insight tools',
            'Additional Trading Pairs',
            'New liquidity pools',
            'Cross-chain bridges',
            'Synthetic asset integration',
          ],
        },
        {
          phase: 'Phase 4: Maturity',
          items: [
            'Governance Implementation',
            'DAO structure setup',
            'Voting mechanisms',
            'Proposal framework',
            'Community DAO',
            'Treasury management',
            'Parameter control',
            'Development funding',
            'Advanced Security Features',
            'Multi-sig implementations',
            'Emergency response system',
            'Enhanced audit coverage',
            'Cross-chain Integration',
            'Layer 2 solutions',
            'Multiple blockchain support',
            'Unified liquidity management',
          ],
        },
      ],
    },
    {
      id: 'ico-plan',
      title: 'ICO Plan (Simplicity-Focused)',
      icon: faRocket,
      subSections: [
        {
          title: 'ICO Parameters',
          content: `- **Duration:** 12 months.  
          - **Accepted Currencies:** POL, USDC, and other approved ERC20 tokens.  
          - **Rate:** Fixed C100 per POL/USDC, with dynamic updates based on \`polRate\`.  
          - **Liquidity Provider Reward:** Configurable percentage of transaction fees allocated to liquidity providers during the ICO.`,
        },
        {
          title: 'During the ICO',
          content: `- **Purchases:** Investors buy C100 directly from the public sale contract using POL or approved ERC20 tokens.  
          - **Rebase Operations:** Owner or governor periodically calls rebase to keep C100 supply aligned with the top 100 market cap.  
          - **Liquidity Provision:** Liquidity providers contribute to the C100-POL and C100-USDC liquidity pools and earn rewards based on their contribution.`,
        },
        {
          title: 'Post-ICO Finalization and Burning Unsold Tokens',
          content: `At the end of the ICO:
          - **No More Purchases:** ICO phase concludes, preventing further token sales.
          - **Burn Unsold Tokens:** Any unsold tokens are burned, ensuring the supply reflects only actively held tokens.`,
        },
        {
          title: 'Maintaining the Index Post-ICO',
          content: `After the ICO:
          - **Continuous Rebasing:** Continue daily/periodic rebases to adjust supply based on market cap changes.
          - **Automated Upkeep:** Transition to automated rebase operations using oracles and governance decisions.
          - **Governance Enhancements:** Introduce advanced features such as treasury management, automated liquidity rewards, and fee adjustments through community proposals.`,
        },
        {
          title: 'Liquidity Provider Participation During ICO',
          content: `- **Incentives:** During the ICO, liquidity providers are rewarded with a configurable percentage of the total transaction fees generated.
          - **Participation:** Anyone can become a liquidity provider by adding C100 and POL (MATIC) or other approved tokens to supported DEXs.
          - **Rewards Distribution:** Rewards are distributed proportionally based on the amount of liquidity each provider contributes, ensuring fair compensation for contributions.`,
        },
      ],
    },
    {
      id: 'faq',
      title: 'FAQ (112 Questions & Answers)',
      icon: faInfoCircle,
      content: [], // This will be handled separately
    },
    {
      id: 'contact-information',
      title: 'Contact Information',
      icon: faGlobe,
      content: `For further inquiries, support, or to engage with the COIN100 team, please reach out through the following channels:

- **Website:** [https://coin100.link](https://coin100.link)
- **Email:** [mayor@coin100.link](mailto:mayor@coin100.link)
- **Discord:** [Join Our Discord](https://discord.com/channels/1318664310490398770/1318664310490398773)
- **Reddit:** [r/Coin100](https://www.reddit.com/r/Coin100)
- **X:** [@Coin100token](https://x.com/Coin100token)
- **Telegram:** [@Coin100token](https://t.me/coin100token)
- **coin100:** \`0x1459884924e7e973d1579ee4ebcaa4ef0b1c8f21\`
- **publicSale:** \`0x2cdac1848b1c14d36e173e10315da97bb17b5489\``,
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      icon: faHandshake,
      content: `COIN100 (C100) provides a seamless, fair, and transparent way to invest in the top 100 cryptocurrencies. Through a global rebase mechanism, dynamic pricing adjustments, fee-based treasury growth, configurable liquidity provider incentives, and robust security, it aims to become a trusted and stable representation of the crypto market’s collective growth. With a clear path towards decentralized governance and community-driven evolution, C100 empowers investors to participate in a diversified crypto index without the complexities of active portfolio management. Join the community, contribute to liquidity provisioning, and help shape the future of decentralized index investing.`,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 6 },
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.secondary.dark} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${theme.palette.background.paper}40 0%, ${theme.palette.background.default} 100%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={6} textAlign="center" position="relative" zIndex={1}>
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '4rem' },
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 2px 10px ${theme.palette.primary.main}40`,
            }}
          >
            COIN100 Whitepaper
          </Typography>
          <Typography
            variant="h4"
            color="textSecondary"
            sx={{ mb: 4, fontSize: { xs: '1.5rem', md: '2rem' } }}
          >
            The Future of Crypto Index Investing
          </Typography>
        </Box>

        {/* Table of Contents */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 6,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.primary.dark}40`,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Table of Contents
          </Typography>
          <Grid container spacing={2}>
            {sections.map((section, index) => (
              <Grid item xs={12} sm={6} md={4} key={section.id}>
                <Box
                  component="a"
                  href={`#${section.id}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.text.primary,
                    textDecoration: 'none',
                    py: 1,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <FontAwesomeIcon
                    icon={section.icon}
                    style={{ marginRight: '8px', width: '20px' }}
                  />
                  <Typography variant="body1">
                    {index + 1}. {section.title}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Content Sections */}
        {sections.map((section) => (
          <Paper
            key={section.id}
            id={section.id}
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.primary.dark}40`,
              scrollMarginTop: '80px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <FontAwesomeIcon
                icon={section.icon}
                style={{
                  marginRight: '16px',
                  width: '30px',
                  height: '30px',
                  color: theme.palette.primary.main,
                }}
              />
              <Typography variant="h4" component="h2">
                {section.title}
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Handle FAQ Separately */}
            {section.id === 'faq' ? (
              <Box>
                {faqData.categories.map((category) => (
                  <Box key={category.id} mb={3}>
                    <Typography variant="h5" gutterBottom>
                      {category.name}
                    </Typography>
                    {category.questions.map((q) => (
                      <Accordion key={q.id} sx={{ mb: 1 }}>
                        <AccordionSummary
                          expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
                          aria-controls={`panel-content-${q.id}`}
                          id={`panel-header-${q.id}`}
                        >
                          <Typography variant="subtitle1">
                            {q.question}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body1">{q.answer}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                ))}
              </Box>
            ) : section.id === 'roadmap' ? (
              <Grid container spacing={3}>
                {Array.isArray(section.content) &&
                  (section.content as RoadmapPhase[]).map((phase, index) => (
                    <Grid item xs={12} md={6} key={`roadmap-phase-${index}`}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          height: '100%',
                          background: `linear-gradient(135deg, ${theme.palette.background.paper}40 0%, ${theme.palette.background.paper}20 100%)`,
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          {phase.phase}
                        </Typography>
                        <List dense>
                          {phase.items.map(
                            (item: string, itemIndex: number) => (
                              <ListItem key={itemIndex}>
                                <ListItemIcon>
                                  <Box
                                    sx={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      bgcolor: theme.palette.primary.main,
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText primary={item} />
                              </ListItem>
                            )
                          )}
                        </List>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            ) : section.id === 'contact-information' ? (
              <Typography
                variant="body1"
                component="div"
                sx={{ whiteSpace: 'pre-line' }}
              >
                {typeof section.content === 'string' ? section.content : ''}
              </Typography>
            ) : Array.isArray(section.content) ? (
              <List>
                {(section.content as string[]).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            ) : section.subSections ? (
              <Box>
                {section.subSections.map((sub, idx) => (
                  <Box key={idx} mb={3}>
                    <Typography variant="h5" gutterBottom>
                      {sub.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {sub.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" paragraph>
                {section.content}
              </Typography>
            )}
          </Paper>
        ))}

        {/* Contact Information */}
        {/* Already handled in sections */}

        {/* Footer or Additional Sections can be added here */}
      </Container>
    </Box>
  );
};

export default Whitepaper;
