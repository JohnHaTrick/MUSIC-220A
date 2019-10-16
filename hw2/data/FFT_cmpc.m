%% manipulate cmpc data into a something musical!
%  saved data are matrices with following dimensions: [m x n]
%    rows m are the frequency-amplitude FFT pairs
%    columns n are timesteps (50 Hz)

clear
close all

%% import and extract control data
load('SIMDATA_cmpc_obsAvoidance.mat');      % load cmpc data

u_n = optRecord.optVars.u';                 % extract steering commands
u_c = optRecord.optVars.u_c';

u_n = u_n(:,31:10:end-1);                   % crop down to manageable size?
u_c = u_c(:,31:10:end-1);

u_n = [u_n(2,:); u_n(7:21,:)];              % delete short timesteps
u_c = [u_c(2,:); u_c(7:21,:)];

% increase density of points: linear interpolation
interps = 1;
for j = 1:interps
    for i = length(u_n(:,1)) - 1 : -1 : 1
        u_n = [u_n(1:i,:); (u_n(i,:)+u_n(i+1,:))/2; u_n(i+1:end,:)];
        u_c = [u_c(1:i,:); (u_c(i,:)+u_c(i+1,:))/2; u_c(i+1:end,:)];
    end
end

%% FFT parameters
period  = constants.LONG_TS / 2^interps;    % sampling period
samp_f  = 1/period;                         % sampling frequency
samp_N  = size(u_n,1);                      % number of samples
t_rel   = (0:samp_N-1)'*period;             % relative time vector
up_samp = 3;                                % take this times as many samples
f_dom   = samp_f/samp_N ...
        * (0:1/2^(up_samp-1):(samp_N/2))';  % frequency range

idx = 10; % idx of interest

figure();
subplot(2,1,1); hold on;                    % plot the raw signals
    plot(t_rel, u_n(:,idx));
    plot(t_rel, u_c(:,idx));
    xlabel('time');
    ylabel('steer cmd');

%% calculate FFT
FFT_n           = fft( u_n, up_samp*size(u_n,1) );
P2_n            = abs( FFT_n/samp_N );
P1_n            = P2_n( 1:samp_N/2+1, : );
P1_n(2:end-1,:) = P1_n( 2:end-1, : ) * 2;

FFT_c           = fft( u_c, up_samp*size(u_c,1) );
P2_c            = abs( FFT_c/samp_N );
P1_c            = P2_c( 1:samp_N/2+1, : );
P1_c(2:end-1,:) = P1_c( 2:end-1, : ) * 2;

subplot(2,1,2); hold on;
    plot(f_dom(1:size(P1_n,1)), P1_n(:,idx))
    plot(f_dom(1:size(P1_c,1)), P1_c(:,idx))
    xlabel('f [Hz]'); ylabel('amplitude');

%% save data
% round and eliminate first 0-frequency
sig_figs = 3;
freqs_rnd_no0  = round( f_dom(2:size(P1_n,1)), sig_figs );
amps_n_rnd_no0 = round( P1_n(2:end,:),         sig_figs );
amps_c_rnd_no0 = round( P1_c(2:end,:),         sig_figs );

fileID = fopen('frequency-data.js','w');        % save FFT frequencies
fprintf(fileID,strcat('export const frequencies = ', ...
                      jsonencode(freqs_rnd_no0) ));
fprintf(fileID, '\nexport default frequencies');
fclose(fileID);

fileID = fopen('nominal-amp-data.js','w');     % save nominal amplitudes
fprintf(fileID,strcat('export const amplitudes_n = ', ...
                      jsonencode(amps_n_rnd_no0) ));
fprintf(fileID, '\nexport default amplitudes_n');
fclose(fileID);

fileID = fopen('contingency-amp-data.js','w'); % save contingency amplitudes
fprintf(fileID,strcat('export const amplitudes_c = ', ...
                      jsonencode(amps_c_rnd_no0) ));
fprintf(fileID, '\nexport default amplitudes_c');
fclose(fileID);

% f_dom_json = jsonencode(f_dom);             % as json
% P1_n_json  = jsonencode(P1_n);
% P1_c_json  = jsonencode(P1_c);
% save('frequencies.json',     'f_dom_json');
% save('nominal_cmds.json',    'P1_n_json');
% save('contingency_cmds.json','P1_c_json');
% csvwrite('frequencies.csv',      f_dom);    % as csv
% csvwrite('nominal_cmds.csv',     P1_n );
% csvwrite('contingency_cmds.csv', P1_c );

%% clear what we don't need
clear controlParams simParams vehicle world optRecord constnats
clear FFT_n P2_n
clear FFT_c P2_c
clear fileID j idx interps period samp_f samp_N up_samp
