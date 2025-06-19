import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import React from 'react'

const Terms = ({ onBack, onAgree }: { onBack: () => void; onAgree: () => void }) => {
  return (
    <div className='relative h-full w-full'>
      <PopupLayout
        header={
          <Header
            title='Terms of Use'
            action={{
              type: HeaderActionType.BACK,
              onClick: onBack,
            }}
          />
        }
      >
        <div className='flex flex-col gap-3 p-6 !pb-0 h-[calc(100%-72px)] overflow-scroll'>
          <div className='text-black-100 dark:text-white-100 break-words w-full overflow-y-scroll h-[calc(100%-48px)] max-h-[calc(100%-48px)]'>
            <p className='mt-2'>
              <strong>Note</strong>: This product is provided by Noble (NASD, Inc.), not Leap
              Wallet. The terms below are reproduced for your convenience from{' '}
              <a
                className='underline'
                href='https://dollar.noble.xyz/terms-of-use'
                target='_blank'
                rel='noreferrer'
              >
                Noble’s official Terms of Use
              </a>
              . By continuing, you agree to Noble’s terms.
            </p>
            <h2 className='mt-2'>Last revised on: February 26, 2025</h2>
            <p className='mt-2'>
              The service located at&nbsp;
              <a
                className='underline'
                href='https://dollar.noble.xyz/dollar.noble.xyz'
                target='_blank'
                rel='noreferrer'
              >
                dollar.noble.xyz
              </a>
              &nbsp;and all related websites, subdomains and applications (including mobile apps)
              (collectively, the &ldquo;<strong>Site</strong>&rdquo;) is a copyrighted work
              belonging to NASD, Inc. (&ldquo;<strong>NASD</strong>&rdquo;, &ldquo;
              <strong>us</strong>&rdquo;, &ldquo;
              <strong>our</strong>&rdquo;, and &ldquo;<strong>we</strong>&rdquo;). Certain features
              of the Site may be subject to additional guidelines, terms, or rules, which will be
              posted on the Site in connection with such features. All such additional terms,
              guidelines, and rules are incorporated by reference into these Terms.
            </p>
            <p className='mt-2'>
              These Terms of Use (&ldquo;<strong>Terms</strong>&rdquo;), TOGETHER WITH ANY
              APPLICABLE SUPPLEMENTAL TERMS (COLLECTIVELY, &ldquo;<strong>AGREEMENT</strong>
              &rdquo;), set forth the legally binding terms and conditions that govern your use of
              the Site. THIS AGREEMENT GOVERNS THE USE OF THE SITE AND ANY OF THE SERVICES,
              TECHNOLOGY AND RESOURCES AVAILABLE OR ENABLED THROUGH THE SITE (EACH A &ldquo;
              <strong>SERVICE</strong>&rdquo; and COLLECTIVELY, THE &ldquo;<strong>Services</strong>
              &rdquo;) AND APPLY TO ALL INTERNET USERS VISITING, ACCESSING, OR USING THE sERVICES.
              By accessing or using the SERVICES, you are accepting THIS AGREEMENT (on behalf of
              yourself or the entity that you represent), and you represent and warrant that you
              have the right, authority, and capacity to enter into THIS AGREEMENT (on behalf of
              yourself or the entity that you represent). you may not access or use the SERVICES or
              accept THIS AGREEMENT if you are not at least EIGHTEEN (18) years old. If you do not
              agree with all of the provisions of THIS AGREEMENT, do not access and/or use the
              SERVICES.
            </p>
            <p className='mt-2'>
              <strong>
                NASD IS NOT A BROKER, FINANCIAL INSTITUTION, FINANCIAL ADVISOR, INVESTMENT ADVISOR,
                OR INTERMEDIARY AND IS IN NO WAY YOUR AGENT, ADVISOR, OR CUSTODIAN. NASD CANNOT
                INITIATE A TRANSFER OF ANY OF YOUR CRYPTOCURRENCY OR DIGITAL ASSETS OR OTHERWISE
                ACCESS YOUR DIGITAL ASSETS. NASD HAS NO FIDUCIARY RELATIONSHIP OR OBLIGATION TO YOU
                REGARDING ANY DECISIONS OR ACTIVITIES THAT YOU EFFECT IN CONNECTION WITH YOUR USE OF
                THE SERVICES. WE DO NOT PARTICIPATE IN ANY TRANSACTIONS ON THIRD-PARTY PROTOCOLS,
                AND DO NOT RECOMMEND, ENDORSE, OR OTHERWISE TAKE A POSITION ON YOUR USE OF THESE
                SERVICES.
              </strong>
            </p>
            <p className='mt-2'>
              <strong>
                NASD IS NOT CAPABLE OF PERFORMING TRANSACTIONS OR SENDING TRANSACTION MESSAGES ON
                YOUR BEHALF. ALL TRANSACTIONS INITIATED THROUGH OUR SERVICES ARE INITIATED BY YOU
                THROUGH YOUR WALLET AND COMPLETED THROUGH THE APPLICABLE THIRD-PARTY SERVICE.
              </strong>
            </p>
            <p className='mt-2'>
              <strong>
                PLEASE BE AWARE THAT SECTION 12.2 CONTAINS PROVISIONS GOVERNING HOW TO RESOLVE
                DISPUTES BETWEEN YOU AND NASD. AMONG OTHER THINGS, SECTION 12.2 INCLUDES AN
                AGREEMENT TO ARBITRATE WHICH REQUIRES, WITH LIMITED EXCEPTIONS, THAT ALL DISPUTES
                BETWEEN YOU AND US SHALL BE RESOLVED BY BINDING AND FINAL ARBITRATION. SECTION 12.2
                ALSO CONTAINS A CLASS ACTION AND JURY TRIAL WAIVER. PLEASE READ SECTION 12.2
                CAREFULLY.
              </strong>
            </p>
            <p className='mt-2'>
              <strong>
                UNLESS YOU OPT OUT OF THE AGREEMENT TO ARBITRATE WITHIN THIRTY (30) DAYS: (a) YOU
                WILL ONLY BE PERMITTED TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF AGAINST US ON AN
                INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE
                ACTION OR PROCEEDING AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION
                LAWSUIT OR CLASS-WIDE ARBITRATION; AND (b) YOU ARE WAIVING YOUR RIGHT TO PURSUE
                DISPUTES OR CLAIMS AND SEEK RELIEF IN A COURT OF LAW AND TO HAVE A JURY TRIAL.
              </strong>
            </p>
            <p className='mt-2'>
              Your use of, and participation in, certain Services may be subject to Supplemental
              Terms (defined below), which will either be listed in these Terms or will be presented
              to you for your acceptance when you sign up to use the supplemental Service. If these
              Terms are inconsistent with the Supplemental Terms, the Supplemental Terms shall
              control with respect to such Service.
            </p>
            <p className='mt-2'>
              PLEASE NOTE THAT THESE TERMS ARE SUBJECT TO CHANGE BY NASD IN ITS SOLE DISCRETION AT
              ANY TIME. When changes are made, NASD will make a new copy of these Terms available
              within the Services and any new Supplemental Terms will be made available from within,
              or through, the affected Service. We will also update the &ldquo;Last Updated&rdquo;
              date at the top of these Terms. Any changes to these Terms will be effective
              immediately for new users of the Site and/or Services and will be effective thirty
              (30) days after posting notice of such changes on the Site and/or Services for
              existing users of the Services. NASD may require you to provide consent to the updated
              Agreement in a specified manner before further use of the Site and/or the Services is
              permitted. If you do not agree to any change(s) after receiving a notice of such
              change(s), you shall stop using the Site and/or the Services. Otherwise, your
              continued use of the Site and/or Services constitutes your acceptance of such
              change(s). PLEASE REGULARLY CHECK THE SERVICES TO VIEW THE THEN-CURRENT TERMS.
            </p>
            <ol>
              <li>
                <p className='mt-2'>
                  Description of the Services. The Services include the Site and the Services
                  enabled thereby, as further defined and described below. There are important risks
                  and limitations associated with the use of the Services as described below and
                  elsewhere in this Agreement. Please read them carefully.
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      <strong>The Services.</strong>&nbsp;NASD&apos;s Services include an online
                      platform that allows users to connect compatible third-party digital asset
                      wallets (&ldquo;Wallets&rdquo;) to the Services, view and interact with
                      certain approved digital assets (&ldquo;User Assets&rdquo;) in their Wallet.
                      The Services may assist users in drafting transaction messages that would swap
                      certain User Assets on one blockchain in exchange for digital assets on a
                      different blockchain through a Third-Party Service (defined below). For the
                      avoidance of doubt, users of the Services, and not NASD, control the Private
                      Key (defined below) with respect to each such Wallet that initiates and
                      executes all such transactions. User Assets may be displayed on the Services
                      based on predetermined algorithms and other metrics developed or designed by
                      us. NASD may change the Services or add additional functionality from time to
                      time.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>User Asset Information.</strong>&nbsp;Users can use the Services (a)
                      to aggregate and display publicly available information related to any User
                      Assets; and (b) to draft transaction messages which the user can independently
                      use in conjunction with a Wallet to purchase and/or sell User Assets. User
                      Asset visualizations may include graphs, projections, and other information
                      about your User Assets (collectively, &ldquo;User Asset Information&rdquo;).
                      Information that may be provided to you by the Services about your allocation
                      of your User Assets is considered User Asset Information. You acknowledge that
                      User Asset Information is provided by Third-Party Services and NASD is not
                      liable for any losses arising out of, related to or based on your use of or
                      reliance on User Asset Information. We encourage you to independently verify
                      all User Asset Information.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Your User Assets.</strong>&nbsp;When you use the Services to transfer,
                      exchange, buy, or sell User Assets, you represent and warrant that (a) you own
                      or have the authority to connect the Wallet(s) containing such User Assets;
                      (b) you own or have the authority to transfer such User Assets; (c) all User
                      Assets you transfer or otherwise make available in connection with the
                      Services have been earned, received, or otherwise acquired by you in
                      compliance with all applicable laws; and (d) no User Assets that you transfer
                      or otherwise make available in connection with the Services have been
                      &ldquo;tumbled&rdquo; or otherwise undergone any process designed to hide,
                      mask, or obscure the origin or ownership of such User Assets.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Transfers of User Assets.</strong>&nbsp;By combining publicly
                      available information with your interactions with the Services, the Services
                      can draft standard transaction messages that are designed to accomplish your
                      operational goals as expressed through the interactions with the Services. You
                      may seek to broadcast such messages to the applicable software-based
                      Third-Party Service that facilitates the purchase, transfer, or exchange of
                      User Assets (each, a &ldquo;Third-Party Protocol&rdquo;) or validator network
                      for any supported blockchain in order to initiate a transaction involving User
                      Assets. All draft transaction messages are designed to be delivered by the
                      Services via API to a Wallet selected by you. You must personally review and
                      authorize all transaction messages that you wish to execute; this requires you
                      to sign the relevant transaction message with your Private Key, which is
                      inaccessible to the Services or NASD. The authorized message will then be
                      broadcast to validators through the Wallet and, as applicable to a particular
                      transaction, you may be required to pay Third-Party Fees (defined below) to
                      have the validators record the results of the transaction message on the
                      applicable blockchain, resulting in a transfer of User Assets. NASD and the
                      Services are not your agents or intermediaries, do not store or have access to
                      or control over any Third-Party Protocol or other Third-Party Service, User
                      Assets, private keys, passwords, accounts or other property of yours, and are
                      not capable of performing transactions or sending transaction messages on your
                      behalf. All transactions through Third-Party Protocols are effected between
                      you and the applicable Third-Party Protocol, and NASD shall have no liability
                      in connection with same.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Registration.</strong>
                    </p>
                    <ol>
                      <li>
                        <p className='mt-2'>
                          <strong>Registering Your Account.</strong>&nbsp;In order to access certain
                          features of the Services, you may be required to register an account on
                          the Services (&ldquo;<strong>Account</strong>&rdquo;), connect a Wallet to
                          the Services, and/or create a Wallet through a Third-Party Service. You
                          acknowledge and agree that our obligation to provide you with any Services
                          is conditioned on the Registration Data (defined below) being accurate and
                          complete at all times during the term of this Agreement. You agree not to
                          use the Services if you have been previously removed by NASD, or if you
                          have been previously banned from any of the Services. NASD reserves the
                          right to obtain and retain any Registration Data or other identifying
                          information it as it may determine from time to time in order for you to
                          use and continue to use the Services.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          <strong>Registration Data.</strong>&nbsp;In registering an Account on the
                          Services, you shall (i) provide true, accurate, current, and complete
                          information about yourself as prompted by the registration form (the
                          &ldquo;
                          <strong>Registration Data</strong>&rdquo;), and (ii) maintain and promptly
                          update the Registration Data to keep it true, accurate, current, and
                          complete.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          <strong>Your Account.</strong>&nbsp;Notwithstanding anything to the
                          contrary herein, you acknowledge and agree that you have no ownership or
                          other property interest in your Account, and you further acknowledge and
                          agree that all rights in and to your Account are and will forever be owned
                          by and inure to the benefit of NASD. Furthermore, you are responsible for
                          all activities that occur under your Account. You shall monitor your
                          Account to restrict use by minors, and you will accept full responsibility
                          for any unauthorized use of the Services by minors. You may not share your
                          Account or password with anyone, and you agree to notify NASD immediately
                          of any unauthorized use of your password or any other breach of security.
                          If you provide any Registration Data or other information that is untrue,
                          inaccurate, incomplete or not current, or NASD has reasonable grounds to
                          suspect that any information you provide is untrue, inaccurate, incomplete
                          or not current, NASD has the right to suspend or terminate your Account
                          and refuse any and all current or future use of the Services (or any
                          portion thereof). You agree not to create an Account using a false
                          identity or information, or on behalf of someone other than yourself. You
                          agree not to create an Account or use the Services if you have been
                          previously removed by NASD, or if you have been previously banned from any
                          of the Services.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          <strong>Representations.</strong>&nbsp;You represent and warrant that:
                        </p>
                        <ol>
                          <li>
                            <p className='mt-2'>
                              You are (1) at least eighteen (18) years old; (2) of legal age to form
                              a binding contract; and (3) not a person barred from using Services
                              under the laws of the United States, your place of residence or any
                              other applicable jurisdiction. If you are acting on behalf of a DAO or
                              other entity, whether or not such entity is formally incorporated
                              under the laws of your jurisdiction, you represent and warrant that
                              you have all right and authority necessary to act on behalf of such
                              entity.
                            </p>
                          </li>
                          <li>
                            <p className='mt-2'>
                              None of: (1) you; (2) any affiliate of any entity on behalf of which
                              you are entering into this Agreement; (3) any other person having a
                              beneficial interest in any entity on behalf of which you are entering
                              into this Agreement (or in any affiliate thereof); or (4) any person
                              for whom you are acting as agent or nominee in connection with this
                              Agreement is: (A) a country, territory, entity or individual named on
                              an OFAC list as provided at&nbsp;
                              <a
                                className='underline'
                                href='http://www.treas.gov/ofac'
                                target='_blank'
                                rel='noreferrer'
                              >
                                http://www.treas.gov/ofac
                              </a>
                              , or any person or entity prohibited under the OFAC programs,
                              regardless of whether or not they appear on the OFAC list; or (B) a
                              senior foreign political figure, or any immediate family member or
                              close associate of a senior foreign political figure. There is no
                              legal proceeding pending that relates to your activities relating to
                              buying, selling, staking, or otherwise using cryptocurrency or any
                              other token- or digital asset- trading or blockchain technology
                              related activities;
                            </p>
                          </li>
                          <li>
                            <p className='mt-2'>
                              You have not failed to comply with, and have not violated, any
                              applicable legal requirement relating to any blockchain technologies,
                              User Assets, or token-trading activities or any other applicable laws,
                              including, but not limited to, anti-money laundering or terrorist
                              financing laws, and no investigation or review by any governmental
                              entity is pending or, to your knowledge, has been threatened against
                              or with respect to you, nor does any government order or action
                              prohibit you or any of your representatives from engaging in or
                              continuing any conduct, activity or practice relating to
                              cryptocurrency.
                            </p>
                          </li>
                        </ol>
                      </li>
                    </ol>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Staking Rewards.</strong>&nbsp;Certain Third-Party Protocols may offer
                      or provide User Asset rewards, including generated yield (&ldquo;
                      <strong>Staking Rewards</strong>&rdquo;). NO STAKING REWARDS ARE PROVIDED BY
                      NASD. Any Staking Rewards will be at the sole discretion of the applicable
                      Third-Party Protocol, and NASD has no obligation to facilitate any Staking
                      Rewards payment or any liability in connection with any Staking Rewards or any
                      failure to receive the same. NASD does not guarantee any Staking Rewards or
                      any other rewards on or in connection with your User Assets.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Wallets.</strong>&nbsp;In connection with certain features of the
                      Services you will need to create and/or connect a Wallet owned or controlled
                      by you. Access to and use of a Wallet is subject to additional terms and
                      conditions between you and the provider of such Wallet. Please note that if a
                      Wallet or associated Service becomes unavailable then you should not attempt
                      to use such Wallet in connection with the Services, and we disclaim all
                      liability in connection with the foregoing, including without limitation any
                      inability to access any User Assets you have sent to or stored in such Wallet.
                      PLEASE NOTE THAT YOUR RELATIONSHIP WITH ANY THIRD-PARTY SERVICE PROVIDERS
                      ASSOCIATED WITH YOUR WALLET IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH
                      THIRD-PARTY SERVICE PROVIDERS, AND NASD DISCLAIMS ANY LIABILITY FOR
                      INFORMATION THAT MAY BE PROVIDED TO IT OR USER ASSETS THAT MAY BE TRANSFERRED
                      VIA THE PROTOCOL BY OR THROUGH SUCH THIRD-PARTY SERVICE PROVIDERS. Access to
                      your Wallet may require the use of a private key, passphrase, or Third-Party
                      Service (&ldquo;
                      <strong>Private Key</strong>&rdquo;) and NASD has no ability to access your
                      Wallet without your involvement and authority. Your Private Key is unique to
                      you and shall be maintained by you. If you lose your Private Key, you may lose
                      access to your Wallet and any contents thereof, unless otherwise set forth in
                      the agreement between you and the provider of the applicable Wallet. NASD does
                      not have the ability to recover a lost Private Key. While a Wallet may be
                      interoperable with other compatible blockchain platforms, tokens, or services,
                      only User Assets supported by NASD that are stored in your Wallet will be
                      accessible through the Services.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Supplemental Terms.</strong>&nbsp;Your use of, and participation in,
                      certain features and functionality of the Services may be subject to
                      additional terms (&ldquo;<strong>Supplemental Terms</strong>&rdquo;). Such
                      Supplemental Terms will either be set forth in the applicable supplemental
                      Services or will be presented to you for your acceptance when you sign up to
                      use the supplemental Services. If these Terms are inconsistent with the
                      Supplemental Terms, then the Supplemental Terms control with respect to such
                      supplemental Service.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Necessary Equipment and Software.</strong>&nbsp;You must provide all
                      equipment, software, and hardware necessary to connect to the Services. You
                      are solely responsible for any fees, including Internet connection or mobile
                      fees, that you incur when accessing the Services. You are solely responsible
                      for keeping your hardware devices secure. NASD will not be responsible if
                      someone else accesses your devices and authorizes a transaction upon receipt
                      of a valid transfer initiated from the Services.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Points Program.</strong>&nbsp;Subject to your ongoing compliance with
                      this Agreement and any Points Program Terms (defined below) made available by
                      NASD from time to time, NASD may enable you to participate in a limited
                      program that rewards users for interacting with the Service (&ldquo;Points
                      Program&rdquo;) by allocating such users with digital assets that bear no cash
                      or monetary value and are made available by NASD (&ldquo;Points,&rdquo; as
                      further described below). Your participation in any Points Program constitutes
                      your acceptance of the then-current terms and conditions applicable thereto at
                      the time of such participation (&ldquo;Points Program Terms&rdquo;), as may be
                      modified or updated by NASD in its sole discretion. Additional terms
                      applicable to the Points Program, which shall constitute part of the Points
                      Program Terms, may be set forth on the Service from time to time.
                    </p>
                    <ol>
                      <li>
                        <p className='mt-2'>
                          <strong>Points.</strong>&nbsp;Points will be allocated in accordance with
                          the then-current Points Program Terms and any applicable Supplemental
                          Terms. NASD does not guarantee that you will receive or be eligible to
                          receive any minimum amount of Points by participating in the Points
                          Program. Points have no monetary value and cannot be redeemed for cash or
                          cash equivalent, including any cryptocurrency. Accumulating Points does
                          not entitle you to any vested rights, and NASD does not guarantee in any
                          way the continued availability of Points. POINTS HAVE NO CASH VALUE.
                          POINTS ARE MADE AVAILABLE &ldquo;AS IS&rdquo; AND WITHOUT WARRANTY OF ANY
                          KIND.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          <strong>Taxes.</strong>&nbsp;In the event that any applicable authority
                          determines that your receipt of Points is a taxable event, you agree that
                          you, and not NASD, are solely liable for payment of such taxes, and you
                          agree to indemnify NASD in connection with same.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          <strong>Disclaimers.</strong>&nbsp;Points are provided solely as an
                          optional enhancement to users to incentivize participation in the Service.
                          Points do not constitute compensation or any other form of consideration
                          for services. You agree that Points may be cancelled or revoked by NASD at
                          any time, including if you breach this Agreement; misuse or abuse the
                          Points Program; or commit or participate in any fraudulent activity
                          related to the Points Program. NASD RESERVES THE RIGHT TO MODIFY OR
                          TERMINATE THE POINTS PROGRAM AT ANY TIME, FOR ANY OR FOR NO REASON, WITH
                          OR WITHOUT NOTICE TO YOU. In the event of any termination, all Points will
                          expire immediately as of the effective date of termination.
                        </p>
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Your Assumption of Risk</strong>
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      When you use the Services, you understand and acknowledge that NASD is not a
                      financial OR INVESTMENT advisor and that the Services ENTAIL A RISK OF LOSS
                      AND may not meet your needs. NASD may not be able to foresee or anticipate
                      technical or other difficulties which may result in data loss or other service
                      interruptions. NASD encourages you to periodically confirm the valuation of
                      your User Assets. NASD does not and cannot make any guarantee that your User
                      Assets will not lose value. The prices of cryptocurrency assets can be
                      extremely volatile. NASD makes no warranties as to the markets in which your
                      User Assets are staked, transferred, purchased, or traded.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      You understand that like any other software, the Services could be at risk of
                      third-party malware, hacks, or cybersecurity breaches. You agree that it is
                      your responsibility to monitor your User Assets regularly and confirm their
                      proper use and deployment consistent with your intentions.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      NASD has no control over any blockchain and therefore cannot and does not
                      ensure that any transaction details that you submit or receive via our
                      Services will be validated by or confirmed on the relevant blockchain, and
                      NASD does not have the ability to facilitate any cancellation or modification
                      requests. You accept and acknowledge that you take full responsibility for all
                      activities that you effect through the Services and accept all risks of loss,
                      to the maximum extent permitted by law. You further accept and acknowledge
                      that:
                    </p>
                    <ol>
                      <li>
                        <p className='mt-2'>
                          You represent and warrant that you (i) have the necessary technical
                          expertise and ability to review and evaluate the security, integrity, and
                          operation of your Wallets and any blockchains to which your User Assets
                          may be deployed or transferred in connection with the Services; (ii) have
                          the knowledge, experience, understanding, professional advice, and
                          information to make your own evaluation of the merits, risks, and
                          applicable compliance requirements under applicable laws of any use of any
                          blockchains to which your User Assets may be deployed in connection with
                          the Services; (iii) know, understand, and accept the risks associated with
                          any blockchains to which your User Assets may be deployed in connection
                          with the Services; and (iv) accept the risks associated with blockchain
                          technology generally, and are responsible for conducting your own
                          independent analysis of the risks specific to your use of the Services.
                          You further agree that NASD will have no responsibility or liability for
                          such risks.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          There are risks associated with using digital assets, including but not
                          limited to, the risk of hardware, software, and Internet connections; the
                          risk of malicious software introduction; the risk that third parties may
                          obtain unauthorized access to information stored within your Wallets; the
                          risks of counterfeit assets, mislabeled assets, assets that are vulnerable
                          to metadata decay, assets on smart contracts with bugs, and assets that
                          may become untransferable; and the risk that such digital assets may
                          fluctuate in value. You accept and acknowledge that NASD will not be
                          responsible for any communication failures, disruptions, errors,
                          distortions, delays, or losses you may experience when using blockchain
                          technology, however caused.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          The regulatory regimes governing blockchain technologies,
                          cryptocurrencies, and tokens are uncertain, and new regulations or
                          policies, or new or different interpretations of existing regulations, may
                          materially adversely affect the development of the Services and the value
                          of your User Assets.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          NASD makes no guarantee as to the functionality of any blockchain&apos;s
                          decentralized governance, which could, among other things, lead to delays,
                          conflicts of interest, or operational decisions that are unfavorable to
                          your User Assets. You acknowledge and accept that the protocols governing
                          the operation of a blockchain may be subject to sudden changes in
                          operating rules which may materially alter the blockchain and affect the
                          value and function of User Assets supported by that blockchain.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          NASD makes no guarantee as to the security of any blockchain or Wallet.
                          NASD is not liable for any hacks, double spending, or any other attacks on
                          any blockchain or your Wallet.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          Any blockchain may slash or otherwise impose penalties on certain
                          validators (including validators to which your User Assets have been
                          deployed) in response to any activity not condoned by such blockchain. You
                          acknowledge and agree that NASD shall have no liability in connection with
                          any such slashing or penalties, including any slashing or penalties that
                          result in a loss or depreciation of value of your User Assets.
                        </p>
                      </li>
                      <li>
                        <p className='mt-2'>
                          Any blockchain supported by the Services is controlled by third parties,
                          and NASD is not responsible for their performance nor any risks associated
                          with the use thereof. The Services rely on, and NASD makes no guarantee or
                          warranties as to the functionality of or access to any blockchain.
                        </p>
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>License to the Services</strong>
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      <strong>License to Services.</strong>&nbsp;Subject to this Agreement, NASD
                      grants you a non-transferable, non-exclusive, revocable, limited license to
                      use and access and use the Services solely for your own personal,
                      noncommercial use.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Certain Restrictions.</strong>&nbsp;The rights granted to you in this
                      Agreement are subject to the following restrictions: (a) you shall not
                      license, sell, rent, lease, transfer, assign, distribute, host, or otherwise
                      commercially exploit the Site or any Service, whether in whole or in part, or
                      any content displayed on the Site or any Service; (b) you shall not modify,
                      make derivative works of, disassemble, reverse compile, or reverse engineer
                      any part of the Site or any Service; (c) you shall not access the Site or any
                      Services in order to build a similar or competitive website, product, or
                      service; and (d) except as expressly stated herein, no part of the Site or any
                      Services may be copied, reproduced, distributed, republished, downloaded,
                      displayed, posted, or transmitted in any form or by any means. Unless
                      otherwise indicated, any future release, update, or other addition to
                      functionality of the Site or any Services shall be subject to this Agreement.
                      All copyright and other proprietary notices on the Site (or on any content
                      displayed on the Site) must be retained on all copies thereof.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Modification.</strong>&nbsp;NASD reserves the right, at any time, to
                      update, modify, suspend, or discontinue the Services (in whole or in part)
                      with or without notice to you. You agree that NASD will not be liable to you
                      or to any third party for any modification, suspension, or discontinuation of
                      the Service or any part thereof. You may need to update third-party software
                      from time to time in order to use the Services.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>No Support or Maintenance.</strong>&nbsp;You acknowledge and agree
                      that NASD will have no obligation to provide you with any support or
                      maintenance in connection with the Services.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Ownership.</strong>&nbsp;You acknowledge that all the intellectual
                      property rights, including copyrights, patents, trademarks, and trade secrets,
                      in the Site and its content (including any Services) are owned by NASD or
                      NASD&apos;s suppliers. Neither this Agreement (nor your access to the Site)
                      transfers to you or any third party any rights, title, or interest in or to
                      such intellectual property rights, except for the limited access rights
                      expressly set forth in Sections 3.1 and 3.2. NASD and its suppliers reserve
                      all rights not granted in this Agreement. There are no implied licenses
                      granted under this Agreement.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Third-Party Services.</strong>&nbsp;Certain features of the Services
                      may rely on third-party websites, services, technology, or applications
                      accessible or otherwise connected to the Services but not provided by NASD,
                      including without limitation any blockchains, any validator on such
                      blockchains, and our third-party API providers (each, a &ldquo;
                      <strong>Third-Party Service</strong>
                      &rdquo; and, collectively, &ldquo;<strong>Third-Party Services</strong>
                      &rdquo;). The Service utilizes the cross chain transfer protocol developed by
                      M^0 Foundation (&ldquo;<strong>M^0</strong>&rdquo;) and other M^0 tools to
                      process digital asset transfers. Notwithstanding anything to the contrary in
                      this Agreement, you acknowledge and agree that (a) NASD shall not be liable
                      for any damages, liabilities, or other harms in connection with your use of
                      and/or any inability to access the Third-Party Services; and (b) NASD shall be
                      under no obligation to inquire into and shall not be liable for any damages,
                      other liabilities, or harm to any person or entity relating to any losses,
                      delays, failures, errors, interruptions, or loss of data occurring directly or
                      indirectly by reason of Third-Party Services or any other circumstances beyond
                      NASD&apos;s control, including without limitation the failure of a blockchain
                      or other Third-Party Service. You further acknowledge and agree that you will
                      comply with the terms of all Third-Party Services including without limitation
                      M^0.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Feedback.</strong>&nbsp;If you provide NASD with any feedback or
                      suggestions regarding the Site or any Services (&ldquo;
                      <strong>Feedback</strong>
                      &rdquo;), you hereby grant NASD a perpetual, irrevocable, worldwide,
                      royalty-free, transferable, sublicensable, nonexclusive right and license to
                      use and fully exploit such Feedback and related information in any manner it
                      deems appropriate. NASD will treat any Feedback you provide to NASD as
                      non-confidential and non-proprietary. You agree that you will not submit to
                      NASD any information or ideas that you consider to be confidential or
                      proprietary.
                    </p>
                  </li>
                </ol>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>User Conduct.</strong>&nbsp;You agree that you are solely responsible for
                  your conduct in connection with the Services. You agree that you will abide by
                  this Agreement and will not (and will not attempt to): (a) provide false or
                  misleading information to NASD; (b) use or attempt to use another user&apos;s
                  Wallet without authorization from such user; (c) use the Services in any manner
                  that could interfere with, disrupt, negatively affect or inhibit other users from
                  fully enjoying the Services, or that could damage, disable, overburden or impair
                  the functioning of the Services in any manner; (d) develop, utilize, or
                  disseminate any software, or interact with any API in any manner, that could
                  damage, harm, or impair the Services; (e) bypass or circumvent measures employed
                  to prevent or limit access to any service, area, or code of the Services; (f)
                  collect or harvest data from our Services that would allow you to contact
                  individuals, companies, or other persons or entities, or use any such data to
                  contact such entities; (g) use data collected from our Services for any direct
                  marketing activity (including without limitation, email marketing, SMS marketing,
                  telemarketing, and direct marketing); (h) bypass or ignore instructions that
                  control all automated access to the Services; (i) use the Service for any illegal
                  or unauthorized purpose, or engage in, encourage, or promote any activity that
                  violates any applicable law or this Agreement; (j) use your Wallet to carry out
                  any illegal activities in connection with or in any way related to your access to
                  and use of the Services, including but not limited to money laundering, terrorist
                  financing or deliberately engaging in activities designed to adversely affect the
                  performance of the Services; (k) engage in or knowingly facilitate any
                  &ldquo;front-running,&rdquo; &ldquo;wash trading,&rdquo; &ldquo;pump and dump
                  trading,&rdquo; &ldquo;ramping,&rdquo; &ldquo;cornering&rdquo; or fraudulent,
                  deceptive or manipulative trading activities, including: (i) trading User Assets
                  at successively lower or higher prices for the purpose of creating or inducing a
                  false, misleading or artificial appearance of activity in such User Asset, unduly
                  or improperly influencing the market price for such User Asset on the Services or
                  any blockchain or establishing a price which does not reflect the true state of
                  the market in such User Asset; (ii) for the purpose of creating or inducing a
                  false or misleading appearance of activity in a User Asset or creating or inducing
                  a false or misleading appearance with respect to the market in a User Asset; or
                  (iii) participating in, facilitating, assisting or knowingly transacting with any
                  pool, syndicate or joint account organized for the purpose of unfairly or
                  deceptively influencing the market price of a User Asset; (l) use the Services to
                  carry out any financial activities subject to registration or licensing, including
                  but not limited to using the Services to transact in securities, debt financings,
                  equity financings or other similar transactions except in strict compliance with
                  applicable law; (m) use the Service to participate in fundraising for a business,
                  protocol, or platform except in strict compliance with applicable law; (n) make
                  available any content that infringes any patent, trademark, trade secret,
                  copyright, right of publicity or other right of any person or entity; or (o)
                  attempt to access any Wallet that you do not have the legal authority to access.
                  Any unauthorized use of any Services terminates the licenses granted by NASD
                  pursuant to this Agreement.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Privacy Policy.</strong>&nbsp;Please refer to our Privacy Policy for
                  information on how we collect, use, and disclose information from our users. You
                  acknowledge and agree that you use of the Services is subject to, and that we have
                  the right to collect, use, and/or disclose your information (including any
                  personal data you provide to us and your Wallet address and IP address) in
                  accordance with our Privacy Policy.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Fees.</strong>
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      <strong>Fees.</strong>&nbsp;Access to certain Services is free. However, NASD
                      may charge fees (&ldquo;<strong>Fees</strong>&rdquo;) in connection with your
                      use of certain Services, including without limitation, Fees based on the User
                      Assets processed through the Services. All pricing and payment terms for such
                      Fees are as indicated on the Services, and any payment obligations you incur
                      are binding at the time of the applicable transaction. In the event that NASD
                      makes available, and you elect to purchase, any Services in connection with
                      which NASD charges Fees, you agree that you will pay NASD all such Fees at
                      NASD&apos;s then-current standard rates. You agree that all Fees are
                      non-cancellable, non-refundable, and non-recoupable.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Gas Fees.</strong>&nbsp;You may incur charges from third parties
                      (&ldquo;<strong>Third-Party Fees</strong>&rdquo;) for network fees, known as a
                      &ldquo;gas&rdquo; fee, in order to have the blockchain&apos;s validators apply
                      a transaction message and record the results on the blockchain, resulting in a
                      completed transaction. Third-Party Fees are not charged by NASD and are not
                      paid to NASD.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Taxes.</strong>&nbsp;You are solely responsible (and NASD has no
                      responsibility) for determining what, if any, taxes apply to any transaction
                      involving your User Assets.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Currency.</strong>&nbsp;You may not substitute any other currency,
                      whether cryptocurrency or fiat currency, for the currency in which you have
                      contracted to pay any Fees. For clarity, no fluctuation in the value of any
                      currency, whether cryptocurrency or otherwise, will impact or excuse your
                      obligations with respect to any purchase.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Payment Service Provider.</strong>&nbsp;NASD may have agreements with
                      one or more Third-Party Service providers that directly provide you payment
                      services (e.g., card acceptance, User Asset onramps and offramps,
                      cryptocurrency payments, disbursements and settlement, and related services)
                      (each, a &ldquo;
                      <strong>Payment Service Provider</strong>&rdquo;). You may be required to
                      agree to and comply with a separate terms of service with an applicable
                      Payment Services Provider in order to access certain functionality through the
                      Services. NASD is not responsible for your ability or inability to access any
                      services provided by a Payment Services Provider, including without limitation
                      disbursements of funds associated with User Asset transactions. Please note
                      that online payment transactions may be subject to validation checks by our
                      Payment Service Provider and your card issuer, and we are not responsible if
                      your card issuer declines to authorize payment for any reason. Payment Service
                      Providers may use various fraud prevention protocols and industry standard
                      verification systems to reduce fraud, and you authorize each of them to verify
                      and authenticate your payment information. Your card issuer may charge you an
                      online handling fee or processing fee or a cash-advance fee. We are not
                      responsible for any such card issuer or other Third-Party Fees. We may add or
                      change Payment Service Providers at any time in our sole discretion.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Payment.</strong>&nbsp;By providing NASD and/or our Payment Service
                      Provider with your payment information, you agree that NASD and/or our Payment
                      Service Provider (as applicable) is authorized to invoice your Account
                      immediately for all Fees due and payable to NASD hereunder and that no
                      additional notice or consent is required. You shall immediately notify NASD
                      and/or our Payment Service Provider of any change in your payment information
                      to maintain its completeness and accuracy. NASD reserves the right at any time
                      to change its prices and billing methods in its sole discretion. Your failure
                      to provide accurate payment information to NASD and/or our Payment Service
                      Provider, as applicable, constitutes your material breach of this Agreement.
                      Except as expressly set forth in this Agreement, all Fees for the Service are
                      non-refundable.
                    </p>
                  </li>
                </ol>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Indemnification.</strong>&nbsp;You agree to indemnify and hold NASD (and
                  its officers, employees, and agents) harmless, including costs and attorneys&apos;
                  fees, from any claim or demand made by any third party due to or arising out of
                  (a) your use of the Services, (b) your violation of this Agreement, (c) your
                  access and use of any Service, or (d) your violation of applicable laws or
                  regulations. NASD reserves the right, at your expense, to assume the exclusive
                  defense and control of any matter for which you are required to indemnify us, and
                  you agree to cooperate with our defense of these claims. You agree not to settle
                  any matter without the prior written consent of NASD. NASD will use reasonable
                  efforts to notify you of any such claim, action, or proceeding upon becoming aware
                  of it.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Third-Party Links &amp; Ads; Other Users</strong>
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      <strong>Third-Party Links &amp; Ads.</strong>&nbsp;The Services may contain
                      links to third-party websites and services, and/or display advertisements for
                      third parties (collectively, &ldquo;
                      <strong>Third-Party Links &amp; Ads</strong>
                      &rdquo;). Such Third-Party Links &amp; Ads are not under the control of NASD,
                      and NASD is not responsible for any Third-Party Links &amp; Ads. NASD provides
                      access to these Third-Party Links &amp; Ads only as a convenience to you, and
                      does not review, approve, monitor, endorse, warrant, or make any
                      representations with respect to Third-Party Links &amp; Ads. You use all
                      Third-Party Links &amp; Ads at your own risk and should apply a suitable level
                      of caution and discretion in doing so. When you click on any of the
                      Third-Party Links &amp; Ads, the applicable third party&apos;s terms and
                      policies apply, including the third party&apos;s privacy and data gathering
                      practices. You should make whatever investigation you feel necessary or
                      appropriate before proceeding with any transaction in connection with such
                      Third-Party Links &amp; Ads.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Other Users.</strong>&nbsp;Your interactions with other Service users
                      are solely between you and such users. You agree that NASD will not be
                      responsible for any loss or damage incurred as the result of any such
                      interactions. If there is a dispute between you and any Service user, we are
                      under no obligation to become involved.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Release.</strong>&nbsp;You hereby release and forever discharge NASD
                      (and our officers, employees, agents, successors, and assigns) from, and
                      hereby waive and relinquish, each and every past, present, and future dispute,
                      claim, controversy, demand, right, obligation, liability, action, and cause of
                      action of every kind and nature (including personal injuries, death, and
                      property damage), that has arisen or arises directly or indirectly out of, or
                      that relates directly or indirectly to, the Services (including any
                      interactions with, or act or omission of, other Service users or any
                      Third-Party Links &amp; Ads). IF YOU ARE A CALIFORNIA RESIDENT, YOU HEREBY
                      WAIVE CALIFORNIA CIVIL CODE SECTION 1542 IN CONNECTION WITH THE FOREGOING,
                      WHICH STATES: &ldquo;A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE
                      CREDITOR OR RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER
                      FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST
                      HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR OR RELEASED
                      PARTY.&rdquo;
                    </p>
                  </li>
                </ol>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Disclaimers</strong>
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      <strong>AS IS.</strong>&nbsp;THE SERVICES ARE PROVIDED ON AN
                      &ldquo;AS-IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, AND NASD (AND OUR
                      SUPPLIERS) EXPRESSLY DISCLAIM ANY AND ALL WARRANTIES AND CONDITIONS OF ANY
                      KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ALL WARRANTIES OR
                      CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET
                      ENJOYMENT, ACCURACY, OR NON-INFRINGEMENT. WE (AND OUR SUPPLIERS) MAKE NO
                      WARRANTY THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, WILL BE AVAILABLE ON
                      AN UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE ACCURATE,
                      RELIABLE, FREE OF VIRUSES OR OTHER HARMFUL CODE, COMPLETE, LEGAL, OR SAFE. IF
                      APPLICABLE LAW REQUIRES ANY WARRANTIES WITH RESPECT TO THE SERVICES, ALL SUCH
                      WARRANTIES ARE LIMITED IN DURATION TO NINETY (90) DAYS FROM THE DATE OF FIRST
                      USE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO
                      THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. SOME JURISDICTIONS DO NOT ALLOW
                      LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATION MAY
                      NOT APPLY TO YOU.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>
                        NASD IS NOT AN INVESTMENT ADVISOR. NEITHER NASD NOR ITS SUPPLIERS OR
                        LICENSORS SHALL BE RESPONSIBLE FOR INVESTMENT AND OTHER FINANCIAL DECISIONS,
                        OR DAMAGES, OR OTHER LOSSES RESULTING FROM USE OF THE SERVICES. NEITHER NASD
                        NOR ITS SUPPLIERS OR LICENSORS SHALL BE CONSIDERED AN &ldquo;EXPERT&rdquo;
                        UNDER THE APPLICABLE SECURITIES LEGISLATION IN YOUR JURISDICTION. NEITHER
                        NASD NOR ITS SUPPLIERS OR LICENSORS WARRANT THAT THIS SITE COMPLIES WITH THE
                        REQUIREMENTS OF ANY APPLICABLE REGULATORY AUTHORITY, SECURITIES AND EXCHANGE
                        COMMISSION, OR ANY SIMILAR ORGANIZATION OR REGULATOR OR WITH THE SECURITIES
                        LAWS OF ANY JURISDICTION.
                      </strong>
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>NO LIABILITY FOR CONDUCT OF THIRD PARTIES.</strong>&nbsp;YOU
                      ACKNOWLEDGE AND AGREE THAT NASD IS NOT LIABLE, AND YOU AGREE NOT TO HOLD OR
                      SEEK TO HOLD NASD LIABLE, FOR THE CONDUCT OF THIRD PARTIES, INCLUDING
                      OPERATORS OF EXTERNAL SITES AND PROVIDERS OF USER ASSET INFORMATION, AND THAT
                      THE RISK OF INJURY FROM SUCH THIRD PARTIES RESTS ENTIRELY WITH YOU. NASD MAKES
                      NO WARRANTY THAT THE GOODS OR SERVICES PROVIDED BY THIRD PARTIES, INCLUDING
                      WITHOUT LIMITATION ANY DIGITAL ASSETS, WILL MEET YOUR REQUIREMENTS OR BE
                      AVAILABLE ON AN UNINTERRUPTED, SECURE, OR ERROR-FREE BASIS. NASD MAKES NO
                      WARRANTY REGARDING THE QUALITY OF ANY SUCH DIGITAL ASSETS OR OTHER GOODS OR
                      SERVICES, OR THE ACCURACY, TIMELINESS, TRUTHFULNESS, COMPLETENESS OR
                      RELIABILITY OF ANY CONNECTED CONTENT OBTAINED THROUGH THE SERVICES. YOU
                      FURTHER ACKNOWLEDGE AND AGREE THAT USER ASSET INFORMATION COMPRISES DATA
                      PROVIDED BY THIRD-PARTY SOURCES AND NASD DOES NOT VERIFY THE ACCURACY OF SUCH
                      DATA. YOU ARE RESPONSIBLE FOR VERIFYING ALL USER ASSET INFORMATION.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Digital Assets.</strong>&nbsp;Notwithstanding anything to the contrary
                      in this Agreement, NASD shall be under no obligation to inquire into and shall
                      not be liable for any damages, other liabilities or harm to any person or
                      entity relating to (a) the ownership, validity or genuineness of any User
                      Asset; (b) the collectability, insurability, effectiveness, marketability or
                      suitability of any User Asset; or (c) any losses, delays, failures, errors,
                      interruptions or loss of data occurring directly or indirectly by reason of
                      circumstances beyond NASD&apos;s control, including without limitation the
                      failure of a blockchain, Third-Party Protocol or other Third-Party Service.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>No Guaranteed Returns.</strong>&nbsp;All claims, estimates,
                      specifications, and performance measurements described on the Services,
                      including the projected API on User Assets, are made in good faith. You are
                      solely responsible for checking and validating their accuracy and
                      truthfulness, and NASD shall have no responsibility or obligation relating to
                      the foregoing. Any content produced by NASD on the Services has not been
                      subject to audit and is for informational purposes only.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Beta Features.</strong>&nbsp;FROM TIME TO TIME, NASD MAY OFFER NEW
                      &ldquo;BETA&rdquo; FEATURES OR TOOLS WITH WHICH REGISTERED USERS MAY
                      EXPERIMENT. SUCH FEATURES OR TOOLS ARE OFFERED SOLELY FOR EXPERIMENTAL
                      PURPOSES AND WITHOUT ANY WARRANTY OF ANY KIND, AND MAY BE MODIFIED OR
                      DISCONTINUED AT NASD&apos;S SOLE DISCRETION. THE PROVISIONS OF THIS SECTION
                      APPLY WITH FULL FORCE TO SUCH FEATURES OR TOOLS.
                    </p>
                  </li>
                </ol>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Limitation on Liability</strong>
                </p>
              </li>
            </ol>
            <p className='mt-2'>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL NASD (OR OUR SUPPLIERS) BE
              LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOST PROFITS, LOST DATA, COSTS OF PROCUREMENT
              OF SUBSTITUTE PRODUCTS, OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL,
              SPECIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THIS AGREEMENT OR YOUR USE
              OF, OR INABILITY TO USE, THE SERVICES, EVEN IF NASD HAS BEEN ADVISED OF THE
              POSSIBILITY OF SUCH DAMAGES. ACCESS TO, AND USE OF, THE SERVICES IS AT YOUR OWN
              DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE
              OR COMPUTER SYSTEM, OR LOSS OF DATA RESULTING THEREFROM.
            </p>
            <p className='mt-2'>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTWITHSTANDING ANYTHING TO THE CONTRARY
              CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY DAMAGES ARISING FROM OR RELATED TO THIS
              AGREEMENT (FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION), WILL AT
              ALL TIMES BE LIMITED TO A MAXIMUM OF ONE HUNDRED US DOLLARS ($100). THE EXISTENCE OF
              MORE THAN ONE CLAIM WILL NOT ENLARGE THIS LIMIT. YOU AGREE THAT OUR SUPPLIERS WILL
              HAVE NO LIABILITY OF ANY KIND ARISING FROM OR RELATING TO THIS AGREEMENT.
            </p>
            <p className='mt-2'>
              SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR
              INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT
              APPLY TO YOU.
            </p>
            <ol start={11}>
              <li>
                <p className='mt-2'>
                  <strong>Term and Termination.</strong>&nbsp;Subject to this Section, this
                  Agreement will remain in full force and effect while you use the Services. We may
                  suspend or terminate your rights to use the Services at any time for any reason at
                  our sole discretion, including for any use of the Services in violation of this
                  Agreement. Upon termination of your rights under this Agreement, right to access
                  and use the Services will terminate immediately. NASD will not have any liability
                  whatsoever to you for any termination of your rights under this Agreement. Even
                  after your rights under this Agreement are terminated, the following provisions of
                  this Agreement will remain in effect: Section 2, Sections 3.3 through 3.7 and
                  Sections 4 through 13.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Dispute Resolution.</strong>&nbsp;Please read the following arbitration
                  agreement in this Section (the &ldquo;<strong>Arbitration Agreement</strong>
                  &rdquo;) carefully. It requires you to arbitrate Disputes (defined below) with
                  NASD, its parent companies, subsidiaries, affiliates, successors, and assigns, and
                  all of their respective officers, directors, employees, agents, and
                  representatives (collectively, the &ldquo;NASD Parties&rdquo;) and limits the
                  manner in which you can seek relief from the NASD Parties.
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      <strong>Applicability of Arbitration Agreement.</strong>&nbsp;You agree that
                      any dispute between you and any of the NASD Parties relating in any way to
                      Services, or this Agreement (a &ldquo;<strong>Dispute</strong>&rdquo;) will be
                      resolved by binding arbitration, rather than in court, except that (a) you and
                      the NASD Parties may assert individualized claims in small claims court if the
                      claims qualify, remain in such court, and advance solely on an individual,
                      non-class basis; and (b) you or the NASD Parties may seek equitable relief in
                      court for infringement or other misuse of intellectual property rights (such
                      as trademarks, trade dress, domain names, trade secrets, copyrights, and
                      patents).&nbsp;
                      <strong>
                        This Arbitration Agreement shall survive the expiration or termination of
                        this Agreement and shall apply, without limitation, to all claims that arose
                        or were asserted before you agreed to this Agreement (in accordance with the
                        preamble) or any prior version of this Agreement.
                      </strong>
                      &nbsp;This Arbitration Agreement does not preclude you from bringing issues to
                      the attention of federal, state, or local agencies. Such agencies can, if the
                      law allows, seek relief against the NASD Parties on your behalf. For purposes
                      of this Arbitration Agreement, &ldquo;Dispute&rdquo; will also include
                      disputes that arose or involve facts occurring before the existence of this or
                      any prior versions of this Agreement as well as claims that may arise after
                      the termination of this Agreement.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Informal Dispute Resolution.</strong>&nbsp;There might be instances
                      when a Dispute arises between you and NASD. If that occurs, NASD is committed
                      to working with you to reach a reasonable resolution. You and NASD agree that
                      good faith informal efforts to resolve Disputes can result in a prompt,
                      low-cost, and mutually beneficial outcome. You and NASD therefore agree that
                      before either party commences arbitration against the other (or initiates an
                      action in small claims court if a party so elects), we will personally meet
                      and confer telephonically or via videoconference, in a good faith effort to
                      resolve informally any Dispute covered by this Arbitration Agreement (&ldquo;
                      <strong>Informal Dispute Resolution Conference</strong>&rdquo;). If you are
                      represented by counsel, your counsel may participate in the conference, but
                      you will also participate in the conference.
                    </p>
                  </li>
                </ol>
              </li>
            </ol>
            <p className='mt-2'>
              The party initiating a Dispute must give notice to the other party in writing of its
              intent to initiate an Informal Dispute Resolution Conference (&ldquo;
              <strong>Notice</strong>&rdquo;), which shall occur within forty-five (45) days after
              the other party receives such Notice, unless an extension is mutually agreed upon by
              the parties. Notice to NASD that you intend to initiate an Informal Dispute Resolution
              Conference should be sent by email to:&nbsp;
              <a
                className='underline'
                href='mailto:legal@nobleassets.xyz'
                target='_blank'
                rel='noreferrer'
              >
                legal@nobleassets.xyz
              </a>
              , or by regular mail to 850 New Burton Road, Suite 201, City of Dover, County of Kent,
              Delaware 19904. The Notice must include: (a) your name, telephone number, and mailing
              address; (b) the name, telephone number, mailing address, and e-mail address of your
              counsel, if any; and (c) a description of your Dispute.
            </p>
            <p className='mt-2'>
              The Informal Dispute Resolution Conference shall be individualized such that a
              separate conference must be held each time either party initiates a Dispute, even if
              the same law firm or group of law firms represents multiple users in similar cases,
              unless all parties agree; multiple individuals initiating a Dispute cannot participate
              in the same Informal Dispute Resolution Conference unless all parties agree. In the
              time between a party receiving the Notice and the Informal Dispute Resolution
              Conference, nothing in this Arbitration Agreement shall prohibit the parties from
              engaging in informal communications to resolve the initiating party&apos;s Dispute.
              Engaging in the Informal Dispute Resolution Conference is a condition precedent and
              requirement that must be fulfilled before commencing arbitration. The statute of
              limitations and any filing fee deadlines shall be tolled while the parties engage in
              the Informal Dispute Resolution Conference process required by this Section.
            </p>
            <ol start={3}>
              <li>
                <strong>Arbitration Rules and Forum.</strong>&nbsp;This Agreement evidence a
                transaction involving interstate commerce; and notwithstanding any other provision
                herein with respect to the applicable substantive law, the Federal Arbitration Act,
                9 U.S.C. &sect; 1 et seq., will govern the interpretation and enforcement of this
                Arbitration Agreement and any arbitration proceedings. If the process described in
                Section 12.2 does not resolve satisfactorily within sixty (60) days after receipt of
                your Notice, you and NASD agree that either party shall have the right to finally
                resolve the Dispute through binding arbitration. The Federal Arbitration Act governs
                the interpretation and enforcement of this Arbitration Agreement. The arbitration
                will be conducted by JAMS, an established alternative dispute resolution provider.
                Disputes involving claims and counterclaims with an amount in controversy under
                $250,000, not inclusive of attorneys&apos; fees and interest, shall be subject to
                JAMS&apos;s most current version of the Streamlined Arbitration Rules and procedures
                available at&nbsp;
                <a
                  className='underline'
                  href='http://www.jamsadr.com/rules-streamlined-arbitration/'
                >
                  http://www.jamsadr.com/rules-streamlined-arbitration/
                </a>
                ; all other claims shall be subject to JAMS&apos;s most current version of the
                Comprehensive Arbitration Rules and Procedures, available at&nbsp;
                <a
                  className='underline'
                  href='http://www.jamsadr.com/rules-comprehensive-arbitration/'
                >
                  http://www.jamsadr.com/rules-comprehensive-arbitration/
                </a>
                . JAMS&apos;s rules are also available at&nbsp;
                <a
                  className='underline'
                  href='https://dollar.noble.xyz/www.jamsadr.com'
                  target='_blank'
                  rel='noreferrer'
                >
                  www.jamsadr.com
                </a>
                &nbsp;or by calling JAMS at&nbsp;
                <a className='underline' href='tel:800-352-5267' target='_blank' rel='noreferrer'>
                  800-352-5267
                </a>
                . A party who wishes to initiate arbitration must provide the other party with a
                request for arbitration (the &ldquo;Request&rdquo;). The Request must include: (a)
                the name, telephone number, mailing address, and e-mail address of the party seeking
                arbitration; (b) a statement of the legal claims being asserted and the factual
                basis of those claims; (c) a description of the remedy sought and an accurate,
                good-faith calculation of the amount in controversy in United States Dollars; (d) a
                statement certifying completion of the process described in Section 12.2; and (e)
                evidence that the requesting party has paid any necessary filing fees in connection
                with such arbitration.
              </li>
            </ol>
            <p className='mt-2'>
              If the party requesting arbitration is represented by counsel, the Request shall also
              include counsel&apos;s name, telephone number, mailing address, and email address.
              Such counsel must also sign the Request. By signing the Request, counsel certifies to
              the best of counsel&apos;s knowledge, information, and belief, formed after an inquiry
              reasonable under the circumstances, that: (i) the Request is not being presented for
              any improper purpose, such as to harass, cause unnecessary delay, or needlessly
              increase the cost of dispute resolution; (ii) the claims, defenses, and other legal
              contentions are warranted by existing law or by a nonfrivolous argument for extending,
              modifying, or reversing existing law or for establishing new law; and (iii) the
              factual and damages contentions have evidentiary support or, if specifically so
              identified, will likely have evidentiary support after a reasonable opportunity for
              further investigation or discovery.
            </p>
            <p className='mt-2'>
              Unless you and NASD otherwise agree, or the Batch Arbitration (defined below) process
              discussed in Section 12.8 is triggered, the arbitration will be conducted in the
              county where you reside. Subject to JAMS&apos;s rules, the arbitrator may direct a
              limited and reasonable exchange of information between the parties, consistent with
              the expedited nature of the arbitration. If the JAMS is not available to arbitrate,
              the parties will select an alternative arbitral forum. Your responsibility to pay any
              JAMS fees and costs will be solely as set forth in the applicable JAMS rules.
            </p>
            <p className='mt-2'>
              You and NASD agree that all materials and documents exchanged during the arbitration
              proceedings shall be kept confidential and shall not be shared with anyone except the
              parties&apos; attorneys, accountants, or business advisors, and then subject to the
              condition that they agree to keep all materials and documents exchanged during the
              arbitration proceedings confidential.
            </p>
            <ol start={4}>
              <li>
                <p className='mt-2'>
                  <strong>Authority of Arbitrator.</strong>&nbsp;The arbitrator shall have exclusive
                  authority to resolve all disputes subject to arbitration hereunder including,
                  without limitation, any dispute related to the interpretation, applicability,
                  enforceability, or formation of this Arbitration Agreement or any portion of the
                  Arbitration Agreement, except for the following: (a) all Disputes arising out of
                  or relating to Section 12.6, including any claim that all or part of Section 12.6
                  is unenforceable, illegal, void, or voidable, or that Section 12.6 has been
                  breached, shall be decided by a court of competent jurisdiction and not by an
                  arbitrator; (b) except as expressly contemplated in Section 12.8, all Disputes
                  about the payment of arbitration fees shall be decided only by a court of
                  competent jurisdiction and not by an arbitrator; (c) all Disputes about whether
                  either party has satisfied any condition precedent to arbitration shall be decided
                  only by a court of competent jurisdiction and not by an arbitrator; and (d) all
                  Disputes about which version of the Arbitration Agreement applies shall be decided
                  only by a court of competent jurisdiction and not by an arbitrator. The
                  arbitration proceeding will not be consolidated with any other matters or joined
                  with any other cases or parties, except as expressly provided in Section 12.8. The
                  arbitrator shall have the authority to grant motions dispositive of all or part of
                  any claim or dispute. The arbitrator shall have the authority to award monetary
                  damages and to grant any non-monetary remedy or relief available to an individual
                  party under applicable law, the arbitral forum&apos;s rules, and this Agreement
                  (including the Arbitration Agreement). The arbitrator shall issue a written award
                  and statement of decision describing the essential findings and conclusions on
                  which any award (or decision not to render an award) is based, including the
                  calculation of any damages awarded. The arbitrator shall follow the applicable
                  law. The award of the arbitrator is final and binding upon you and us. Judgment on
                  the arbitration award may be entered in any court having jurisdiction.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Waiver of Jury Trial.</strong>&nbsp;EXCEPT AS SPECIFIED in SECTION 12.1
                  YOU AND THE NASD PARTIES HEREBY WAIVE ANY CONSTITUTIONAL AND STATUTORY RIGHTS TO
                  SUE IN COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY. You and the NASD
                  Parties are instead electing that all covered claims and disputes shall be
                  resolved exclusively by arbitration under this Arbitration Agreement, except as
                  specified in Section 12.1 above. An arbitrator can award on an individual basis
                  the same damages and relief as a court and must follow this Agreement as a court
                  would. However, there is no judge or jury in arbitration, and court review of an
                  arbitration award is subject to very limited review.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Waiver of Class or Other Non-Individualized Relief.</strong>&nbsp;YOU AND
                  NASD AGREE THAT, EXCEPT AS SPECIFIED IN SECTION 12.8 EACH OF US MAY BRING CLAIMS
                  AGAINST THE OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT ON A CLASS, REPRESENTATIVE,
                  OR COLLECTIVE BASIS, AND THE PARTIES HEREBY WAIVE ALL RIGHTS TO HAVE ANY DISPUTE
                  BE BROUGHT, HEARD, ADMINISTERED, RESOLVED, OR ARBITRATED ON A CLASS, COLLECTIVE,
                  REPRESENTATIVE, OR MASS ACTION BASIS. ONLY INDIVIDUAL RELIEF IS AVAILABLE, AND
                  DISPUTES OF MORE THAN ONE CUSTOMER OR USER CANNOT BE ARBITRATED OR CONSOLIDATED
                  WITH THOSE OF ANY OTHER CUSTOMER OR USER. Subject to this Arbitration Agreement,
                  the arbitrator may award declaratory or injunctive relief only in favor of the
                  individual party seeking relief and only to the extent necessary to provide relief
                  warranted by the party&apos;s individual claim. Nothing in this paragraph is
                  intended to, nor shall it, affect the terms and conditions under Section 12.8.
                  Notwithstanding anything to the contrary in this Arbitration Agreement, if a court
                  decides by means of a final decision, not subject to any further appeal or
                  recourse, that the limitations of this Section are invalid or unenforceable as to
                  a particular claim or request for relief (such as a request for public injunctive
                  relief), you and NASD agree that that particular claim or request for relief (and
                  only that particular claim or request for relief) shall be severed from the
                  arbitration and may be litigated in the state or federal courts located in the
                  State of Delaware. All other Disputes shall be arbitrated or litigated in small
                  claims court. This Section does not prevent you or NASD from participating in a
                  class-wide settlement of claims.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Attorneys&apos; Fees and Costs.</strong>&nbsp;The parties shall bear their
                  own attorneys&apos; fees and costs in arbitration unless the arbitrator finds that
                  either the substance of the Dispute or the relief sought in the Request was
                  frivolous or was brought for an improper purpose (as measured by the standards set
                  forth in Federal Rule of Civil Procedure 11(b)). If you or NASD need to invoke the
                  authority of a court of competent jurisdiction to compel arbitration, then the
                  party that obtains an order compelling arbitration in such action shall have the
                  right to collect from the other party its reasonable costs, necessary
                  disbursements, and reasonable attorneys&apos; fees incurred in securing an order
                  compelling arbitration. The prevailing party in any court action relating to
                  whether either party has satisfied any condition precedent to arbitration,
                  including the process described in Section 12.2, is entitled to recover their
                  reasonable costs, necessary disbursements, and reasonable attorneys&apos; fees and
                  costs.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Batch Arbitration.</strong>&nbsp;To increase the efficiency of
                  administration and resolution of arbitrations, you and NASD agree that in the
                  event that there are 100 or more individual Requests of a substantially similar
                  nature filed against NASD by or with the assistance of the same law firm, group of
                  law firms, or organizations, within a thirty (30) day period (or as soon as
                  possible thereafter), the JAMS shall (a) administer the arbitration demands in
                  batches of 100 Requests per batch (plus, to the extent there are less than 100
                  Requests left over after the batching described above, a final batch consisting of
                  the remaining Requests); (b) appoint one arbitrator for each batch; and (c)
                  provide for the resolution of each batch as a single consolidated arbitration with
                  one set of filing and administrative fees due per side per batch, one procedural
                  calendar, one hearing (if any) in a place to be determined by the arbitrator, and
                  one final award (&ldquo;
                  <strong>Batch Arbitration</strong>&rdquo;).
                </p>
              </li>
            </ol>
            <p className='mt-2'>
              All parties agree that Requests are of a &ldquo;substantially similar nature&rdquo; if
              they arise out of or relate to the same event or factual scenario and raise the same
              or similar legal issues and seek the same or similar relief. To the extent the parties
              disagree on the application of the Batch Arbitration process, the disagreeing party
              shall advise the JAMS, and the JAMS shall appoint a sole standing arbitrator to
              determine the applicability of the Batch Arbitration process (&ldquo;
              <strong>Administrative Arbitrator</strong>&rdquo;). In an effort to expedite
              resolution of any such dispute by the Administrative Arbitrator, the parties agree the
              Administrative Arbitrator may set forth such procedures as are necessary to resolve
              any disputes promptly. The Administrative Arbitrator&apos;s fees shall be paid by
              NASD.
            </p>
            <p className='mt-2'>
              You and NASD agree to cooperate in good faith with the JAMS to implement the Batch
              Arbitration process including the payment of single filing and administrative fees for
              batches of Requests, as well as any steps to minimize the time and costs of
              arbitration, which may include: (i) the appointment of a discovery special master to
              assist the arbitrator in the resolution of discovery disputes; and (ii) the adoption
              of an expedited calendar of the arbitration proceedings.
            </p>
            <p className='mt-2'>
              This Batch Arbitration provision shall in no way be interpreted as authorizing a
              class, collective, and/or mass arbitration or action of any kind, or arbitration
              involving joint or consolidated claims under any circumstances, except as expressly
              set forth in this provision.
            </p>
            <ol start={9}>
              <li>
                <p className='mt-2'>
                  30-Day Right to Opt Out. You have the right to opt out of the provisions of this
                  Arbitration Agreement by sending a timely written notice of your decision to opt
                  out to the following address: 850 New Burton Road, Suite 201, City of Dover,
                  County of Kent, Delaware 19904, or email to&nbsp;
                  <a
                    className='underline'
                    href='mailto:legal@nobleassets.xyz'
                    target='_blank'
                    rel='noreferrer'
                  >
                    legal@nobleassets.xyz
                  </a>
                  , within thirty (30) days after first becoming subject to this Arbitration
                  Agreement. Your notice must include your name and address and a clear statement
                  that you want to opt out of this Arbitration Agreement. If you opt out of this
                  Arbitration Agreement, all other parts of this Agreement will continue to apply to
                  you. Opting out of this Arbitration Agreement has no effect on any other
                  arbitration agreements that you may currently have with us or may enter into in
                  the future with us.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Invalidity, Expiration.</strong>&nbsp;Except as provided in Section 12.6,
                  if any part or parts of this Arbitration Agreement are found under the law to be
                  invalid or unenforceable, then such specific part or parts shall be of no force
                  and effect and shall be severed and the remainder of the Arbitration Agreement
                  shall continue in full force and effect. You further agree that any Dispute that
                  you have with NASD as detailed in this Arbitration Agreement must be initiated via
                  arbitration within the applicable statute of limitation for that claim or
                  controversy, or it will be forever time barred. Likewise, you agree that all
                  applicable statutes of limitation will apply to such arbitration in the same
                  manner as those statutes of limitation would apply in the applicable court of
                  competent jurisdiction.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>Modification.</strong>&nbsp;Notwithstanding any provision in this
                  Agreement to the contrary, we agree that if NASD makes any future material change
                  to this Arbitration Agreement, you may reject that change within thirty (30) days
                  of such change becoming effective by writing NASD at the following address: 850
                  New Burton Road, Suite 201, City of Dover, County of Kent, Delaware 19904 or email
                  to&nbsp;
                  <a
                    className='underline'
                    href='mailto:legal@nobleassets.xyz'
                    target='_blank'
                    rel='noreferrer'
                  >
                    legal@nobleassets.xyz
                  </a>
                  . Unless you reject the change within thirty (30) days of such change becoming
                  effective by writing to NASD in accordance with the foregoing, your continued use
                  of the Services following the posting of changes to this Arbitration Agreement
                  constitutes your acceptance of any such changes. Changes to this Arbitration
                  Agreement do not provide you with a new opportunity to opt out of the Arbitration
                  Agreement if you have previously agreed to a version of this Agreement and did not
                  validly opt out of arbitration. If you reject any change or update to this
                  Arbitration Agreement, and you were bound by an existing agreement to arbitrate
                  Disputes arising out of or relating in any way to your access to or use of the
                  Services, any communications you receive, any products sold or distributed through
                  the Services or this Agreement, the provisions of this Arbitration Agreement as of
                  the date you first accepted this Agreement (or accepted any subsequent changes to
                  this Agreement) remain in full force and effect. NASD will continue to honor any
                  valid opt outs of the Arbitration Agreement that you made to a prior version of
                  this Agreement.
                </p>
              </li>
              <li>
                <p className='mt-2'>
                  <strong>General</strong>
                </p>
                <ol>
                  <li>
                    <p className='mt-2'>
                      <strong>Changes.</strong>&nbsp;These Terms are subject to occasional revision,
                      When changes are made, NASD will make a new copy of these Terms available at
                      the Site and any new Supplemental Terms will be made available from within, or
                      through, the affected Service on the Site. We will also update the &ldquo;Last
                      Updated&rdquo; date at the top of these Terms. Any changes to this Agreement
                      will be effective immediately for new users of the Site and/ or Services and
                      will be effective thirty (30) days after posting notice of such changes on the
                      Site for existing users. NASD may require you to provide consent to the
                      updated Agreement in a specified manner before further use of the Site and/or
                      the Services is permitted. If you do not agree to any change(s) after
                      receiving a notice of such change(s), you shall stop using the Services.
                      Otherwise, your continued use of the Services constitutes your acceptance of
                      such change(s). PLEASE REGULARLY CHECK THE SITE TO VIEW THE THEN-CURRENT
                      TERMS.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Export.</strong>&nbsp;The Services may be subject to U.S. export
                      control laws and may be subject to export or import regulations in other
                      countries. You agree not to export, reexport, or transfer, directly or
                      indirectly, any U.S. technical data acquired from NASD, or any products
                      utilizing such data, in violation of the United States export laws or
                      regulations.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Disclosures.</strong>&nbsp;NASD is located at the address in Section
                      13.11. If you are a California resident, you may report complaints to the
                      Complaint Assistance Unit of the Division of Consumer Product of the
                      California Department of Consumer Affairs by contacting them in writing at
                      1625 North Market Blvd., Suite N-112, Sacramento, CA 95834, or by telephone
                      at&nbsp;
                      <a
                        className='underline'
                        href='tel:800-952-5210'
                        target='_blank'
                        rel='noreferrer'
                      >
                        (800) 952-5210
                      </a>
                      .
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Electronic Communications.</strong>&nbsp;The communications between
                      you and NASD use electronic means, whether you use the Services or send us
                      emails, or whether NASD posts notices on the Services or communicates with you
                      via email. For contractual purposes, you (a) consent to receive communications
                      from NASD in an electronic form; and (b) agree that all terms and conditions,
                      agreements, notices, disclosures, and other communications that NASD provides
                      to you electronically satisfy any legal requirement that such communications
                      would satisfy if they were in a hardcopy writing. The foregoing does not
                      affect your non-waivable rights.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Governing Law.</strong>&nbsp;THIS AGREEMENT AND ANY ACTION RELATED
                      THERETO WILL BE GOVERNED AND INTERPRETED BY AND UNDER THE LAWS OF THE STATE OF
                      DELAWARE, CONSISTENT WITH THE FEDERAL ARBITRATION ACT, WITHOUT GIVING EFFECT
                      TO ANY PRINCIPLES THAT PROVIDE FOR THE APPLICATION OF THE LAW OF ANOTHER
                      JURISDICTION. THE UNITED NATIONS CONVENTION ON CONTRACTS FOR THE INTERNATIONAL
                      SALE OF GOODS DOES NOT APPLY TO THIS AGREEMENT. To the extent the parties are
                      permitted under this Agreement to initiate litigation in a court, both you and
                      NASD agree that all claims and disputes arising out of or relating to this
                      Agreement will be litigated exclusively in the state or federal courts located
                      in Wilmington, Delaware.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>International Users.</strong>&nbsp;The Services can be accessed from
                      countries around the world and may contain references to Services that are not
                      available in your country. These references do not imply that NASD intends to
                      offer such Services in your country. NASD makes no representations that the
                      Services are appropriate or available for use in your location. Anyone
                      accessing the Services does so of their own volition and is responsible for
                      compliance with applicable law.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Force Majeure.</strong>&nbsp;NASD shall not be liable for any delay or
                      failure to perform resulting from causes outside its control, including, but
                      not limited to, acts of God, war, terrorism, riots, embargos, acts of civil or
                      military authorities, epidemics, pandemics, governing laws, rules or
                      regulations, fire, floods, accidents, strikes or shortages of transportation
                      facilities, fuel, energy, labor or materials.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Export Control.</strong>&nbsp;You may not use, export, import, or
                      transfer the Services except as authorized by U.S. law, the laws of the
                      jurisdiction in which you access the Services, and any other applicable laws.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Entire Agreement.</strong>&nbsp;This Agreement constitutes the entire
                      agreement between you and us regarding the use of the Services. Our failure to
                      exercise or enforce any right or provision of this Agreement shall not operate
                      as a waiver of such right or provision. The section titles in this Agreement
                      are for convenience only and have no legal or contractual effect. The word
                      &ldquo;including&rdquo; means &ldquo;including without limitation&rdquo;. If
                      any provision of this Agreement is, for any reason, held to be invalid or
                      unenforceable, the other provisions of this Agreement will be unimpaired, and
                      the invalid or unenforceable provision will be deemed modified so that it is
                      valid and enforceable to the maximum extent permitted by law. Your
                      relationship to NASD is that of an independent contractor, and neither party
                      is an agent or partner of the other. This Agreement, and your rights and
                      obligations herein, may not be assigned, subcontracted, delegated, or
                      otherwise transferred by you without NASD&apos;s prior written consent, and
                      any attempted assignment, subcontract, delegation, or transfer in violation of
                      the foregoing will be null and void. NASD may freely assign this Agreement.
                      The terms and conditions set forth in this Agreement shall be binding upon
                      assignees.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Copyright/Trademark Information.</strong>&nbsp;Copyright &copy; 2025
                      NASD, Inc. All rights reserved. All trademarks, logos, and service marks
                      (&ldquo;<strong>Marks</strong>&rdquo;) displayed on the Services or on the
                      Services are our property or the property of other third parties. You are not
                      permitted to use these Marks without our prior written consent or the consent
                      of such third party which may own the Marks.
                    </p>
                  </li>
                  <li>
                    <p className='mt-2'>
                      <strong>Contact Information:</strong>
                    </p>
                  </li>
                </ol>
              </li>
            </ol>
            <p className='mt-2'>ATTN: NASD</p>
            <p className='mt-2'>1919 14th Street, Suite 700</p>
            <p className='mt-2'>Boulder, CO 80302</p>
            <p className='mt-2'>
              Email:&nbsp;
              <a
                className='underline'
                href='mailto:legal@nobleassets.xyz'
                target='_blank'
                rel='noreferrer'
              >
                legal@nobleassets.xyz
              </a>
            </p>
          </div>
          <button
            className='w-full text-md font-bold text-white-100 h-12 rounded-full cursor-pointer bg-green-600 hover:bg-green-500'
            onClick={onAgree}
          >
            Agree
          </button>
        </div>
      </PopupLayout>
    </div>
  )
}

export default Terms
